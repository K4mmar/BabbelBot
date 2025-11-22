
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Message, Settings, Progress, TechniqueFeedback, TestResultDetail, LSDResponse, MiniCaseTestAnswer, Report, SkillAssessmentLevel } from '../types';
import { getFrameworks, getReports } from './storageService';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sanitizeAssessment = (assessment: any): SkillAssessmentLevel => {
    if (typeof assessment !== 'string') return "Onvoldoende";
    const lowerCaseAssessment = assessment.toLowerCase().trim().replace('.', '');
    if (lowerCaseAssessment.includes('goed')) return "Goed";
    if (lowerCaseAssessment.includes('voldoende')) return "Voldoende";
    return "Onvoldoende";
};

async function callGeminiWithRetry<T>(apiCall: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    const errorString = error.toString();
    const isOverload = errorString.includes('429') || errorString.includes('503') || errorString.includes('RESOURCE_EXHAUSTED');
    
    if (retries > 0 && isOverload) {
      console.warn(`API rate limit or resource issue. Retrying in ${delay}ms... (${retries} retries left)`);
      await sleep(delay);
      return callGeminiWithRetry(apiCall, retries - 1, delay * 2);
    }
    
    if (isOverload) {
        throw new Error("SYSTEM_BUSY");
    }
    
    console.error("Gemini API call failed after retries or with a non-retriable error:", error);
    throw error;
  }
}

function formatChatHistory(messages: Message[]): string {
  return messages.map(msg => `${msg.sender === 'user' ? 'Student' : 'Cliënt'}: ${msg.text}`).join('\n');
}

export async function* getAIResponseStream(messages: Message[], settings: Settings): AsyncGenerator<string> {
  const model = 'gemini-2.5-flash';
  const chatHistory = formatChatHistory(messages.slice(0, -1));
  const lastUserMessage = messages[messages.length - 1].text;
  const isHulpvraagMode = settings.skill === "Hulpvraag Verhelderen";

  const systemInstruction = isHulpvraagMode
    ? `Je bent een AI-cliënt voor een rollenspel. De student heeft de opdracht om jouw hulpvraag te verhelderen.
      - Werkveld: ${settings.field}
      - Casus: ${settings.case}
      Jouw hulpvraag is in het begin vaag. Reageer natuurlijk en authentiek op de student. Als de student goede (open, verdiepende) vragen stelt, onthul je geleidelijk meer informatie over je situatie, gevoelens en wat je hoopt te bereiken. Als de student sturend is of slechte vragen stelt, word je terughoudender of raak je geïrriteerd. Het doel is een realistisch gesprek. Houd je antwoorden kort en conversationeel.`
    : `Je bent een AI-cliënt voor een rollenspel, ontworpen om Nederlandse HBO Social Work studenten te helpen hun gespreksvaardigheden te oefenen.
      Gedraag je als een cliënt gebaseerd op de volgende context:
      - Werkveld: ${settings.field}
      - Casus: ${settings.case}
      De student oefent de volgende specifieke vaardigheid: "${settings.skill}".
      Het specifieke leerdoel van de student is: "${settings.learningGoal}". Geef antwoorden die de student de mogelijkheid geven om dit leerdoel te behalen.
      Jouw rol is om te reageren als een echte cliënt. Houd je antwoorden kort en conversationeel. Reageer ALLEEN met de tekst van de cliënt.`;

  try {
    const responseStream = await callGeminiWithRetry(() => ai.models.generateContentStream({
      model,
      contents: `${chatHistory}\n\nStudent: ${lastUserMessage}`,
      config: { systemInstruction, temperature: 0.8, topP: 0.9 }
    }));
    for await (const chunk of (responseStream as any)) {
      yield chunk.text;
    }
  } catch (error: any) {
    if (error.message === 'SYSTEM_BUSY') throw error;
    console.error("Error getting AI response stream:", error);
    yield "Sorry, er is iets misgegaan. Probeer het opnieuw.";
  }
}

export async function* getInitialMessageStream(settings: Settings): AsyncGenerator<string> {
    const model = 'gemini-2.5-flash';
    const isHulpvraagMode = settings.skill === "Hulpvraag Verhelderen";

    const systemInstruction = isHulpvraagMode
    ? `Je bent een AI-cliënt in een rollenspel voor een HBO Social Work student.
        - Werkveld: ${settings.field}
        - Casus: ${settings.case}
        De student moet jouw hulpvraag verhelderen. Geef een korte, eerste chatbericht van de cliënt die het gesprek start. De opmerking moet enigszins vaag zijn, zodat de student moet doorvragen. Maximaal 2 zinnen. Reageer ALLEEN met de tekst van de cliënt.`
    : `Je bent een AI-cliënt in een rollenspel voor een HBO Social Work student.
        - Werkveld: ${settings.field}
        - Casus: ${settings.case}
        - De student oefent de vaardigheid: "${settings.skill}" met het leerdoel "${settings.learningGoal}".
        Geef een korte, eerste chatbericht van de cliënt om het gesprek te starten, passend bij de casus. Maximaal 2 zinnen. Reageer ALLEEN met de tekst van de cliënt.`;

    try {
        const responseStream = await callGeminiWithRetry(() => ai.models.generateContentStream({
            model,
            contents: "Start het gesprek.",
            config: { systemInstruction, temperature: 0.9 }
        }));
        for await (const chunk of (responseStream as any)) {
            yield chunk.text;
        }
    } catch (error: any) {
        if (error.message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting initial message stream:", error);
        yield "Hoi, ik weet niet zo goed waar ik moet beginnen...";
    }
}

export async function getInitialMessage(settings: Settings): Promise<string> {
    let fullText = "";
    // Note: generator handles error internally by yielding fallback, but if it throws SYSTEM_BUSY we need to catch it here or let it bubble
    const stream = getInitialMessageStream(settings);
    try {
        for await (const chunk of stream) {
            fullText += chunk;
        }
    } catch (e) {
        throw e; 
    }
    return fullText.trim();
}

export async function* getConcludingMessageStream(settings: Settings): AsyncGenerator<string> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `Je bent een AI-cliënt in een rollenspel. De student heeft zojuist de oefening voor de vaardigheid "${settings.skill}" succesvol afgerond. Geef een korte, afsluitende opmerking die past bij de casus en het gesprek op een natuurlijke manier beëindigt. Bijvoorbeeld: "Oké, bedankt voor het luisteren. Dit heeft me wel aan het denken gezet." Reageer ALLEEN met de tekst van de cliënt.`;
    try {
        const responseStream = await callGeminiWithRetry(() => ai.models.generateContentStream({
            model,
            contents: "Beëindig het gesprek op een positieve manier.",
            config: { systemInstruction, temperature: 0.7 }
        }));
        for await (const chunk of (responseStream as any)) {
            yield chunk.text;
        }
    } catch (error: any) {
        if (error.message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting concluding message:", error);
        yield "Bedankt voor het gesprek.";
    }
}

export const getTechniqueFeedback = async (skill: string, clientStatement: string, studentResponse: string): Promise<TechniqueFeedback> => {
    const FEEDBACK_FRAMEWORKS = getFrameworks();
    const model = 'gemini-3-pro-preview'; // High reasoning model for feedback
    const customFramework = FEEDBACK_FRAMEWORKS[skill] || "Beoordeel de reactie van de student.";
    
    const prompt = `De student oefent de vaardigheid "${skill}".
Cliënt zei: "${clientStatement}"
Student antwoordde: "${studentResponse}"
Jouw taak is om de reactie van de student te beoordelen op basis van het volgende kader:
${customFramework}
Geef een beoordeling ("Onvoldoende", "Voldoende", "Goed") en concrete feedback. De feedback moet een volledige beoordeling zijn op basis van het kader, maar houd het beknopt, maximaal twee alinea's.
Antwoord in JSON-formaat: {"assessment": "...", "feedback": "..."}`;

    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        const parsed = JSON.parse(response.text.trim());
        if (typeof parsed.feedback === 'string') {
            return {
                assessment: sanitizeAssessment(parsed.assessment),
                feedback: parsed.feedback
            };
        }
        throw new Error("Invalid JSON structure");
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting technique feedback:", error);
        return { assessment: "Onvoldoende", feedback: "Kon de feedback niet genereren." };
    }
};

export const getHulpvraagFeedback = async (messages: Message[], settings: Settings): Promise<string> => {
    const model = 'gemini-3-pro-preview'; // Use powerful model for full report analysis
    const chatHistory = formatChatHistory(messages);
    const customFramework = getFrameworks()["Hulpvraag Verhelderen"];

    const prompt = `Analyseer de volgende chatconversatie tussen een Social Work student en een cliënt.
Context:
- Werkveld: "${settings.field}"
- Casus: "${settings.case}"
- Taak Student: Verhelder de hulpvraag.

Conversatie:
${chatHistory}

Jouw taak: Genereer een uitgebreid rapport in HTML-formaat voor de student. Gebruik het volgende kader:
${customFramework}

Gebruik de volgende HTML-tags voor de opmaak:
- Gebruik <h2> voor de titels van de secties.
- Gebruik <p> voor paragrafen.
- Gebruik <strong> voor belangrijke termen (vetgedrukt).
- Gebruik <ul> en <li> voor lijsten met opsommingstekens.
- Gebruik <blockquote> voor citaten uit het gesprek.

Speciale aandacht voor de laatste boodschap van de student: Als dit een samenvattende check van de hulpvraag is, beoordeel dan expliciet of deze samenvatting de kern van het probleem correct en volledig omvat in de sectie 'Analyse van de hulpvraagverheldering'.

Het rapport moet de volgende secties bevatten (gebruik <h2>-tags voor de titels):
- Samenvatting van het gesprek
- Analyse van de hulpvraagverheldering
- Toepassing van gesprekstechnieken
- Sterke punten
- Verbeterpunten
- Eindconclusie

BELANGRIJK: Begin je antwoord direct met de eerste HTML-tag (<h2>). Voeg GEEN inleidende zinnen, uitleg of markdown-codeblokken (zoals \`\`\`html) toe. Je antwoord moet uitsluitend pure HTML-code zijn.`;
    
    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model,
            contents: prompt,
            config: { temperature: 0.6 }
        }));

        let reportHtml = response.text.trim();

        // Strip any leading text and markdown specifier before the first HTML tag.
        const firstTagIndex = reportHtml.indexOf('<');
        if (firstTagIndex > 0) {
            reportHtml = reportHtml.substring(firstTagIndex);
        }

        // Strip any trailing markdown specifier.
        if (reportHtml.endsWith('```')) {
            reportHtml = reportHtml.slice(0, -3).trim();
        }
        
        return reportHtml;

    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error generating hulpvraag feedback report:", error);
        return "<h2>Fout</h2><p>Er is een fout opgetreden bij het genereren van het rapport. Probeer het later opnieuw.</p>";
    }
};

export async function getChallengeBatch(skill: string, count: number): Promise<string[]> {
    const model = 'gemini-2.5-flash'; // Creative generation is fine on flash
    let prompt: string;

    if (skill === "Samenvatten") {
        prompt = `Genereer ${count} verschillende, korte verhalen van een cliënt in een Social Work context. Elk verhaal moet 3-5 zinnen lang zijn en een duidelijk dilemma of probleem beschrijven. Het moet een onderliggend gevoel suggereren (zoals frustratie, onmacht of verdriet) en eindigen op een manier die een student uitnodigt om de kern samen te vatten. Het moet klinken als een authentiek fragment uit een gesprek. Geef alleen een JSON-array met strings terug.`;
    } else {
        prompt = `Genereer ${count} verschillende, korte en realistische uitspraken van een cliënt in een Social Work context. Deze uitspraken moeten een student uitdagen om de vaardigheid "${skill}" toe te passen. Geef alleen een JSON-array met strings terug. Voorbeeld: ["uitspraak 1", "uitspraak 2"]`;
    }

    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        const challenges = JSON.parse(response.text.trim());
        if (Array.isArray(challenges) && challenges.every(c => typeof c === 'string')) {
            return challenges;
        }
        throw new Error("Invalid response format");
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting challenge batch:", error);
        return Array(count).fill("Er is iets misgegaan, ik weet niet wat ik moet zeggen.");
    }
}

export async function getBulkTechniqueFeedback(answers: { skill: string; clientStatement: string; studentResponse: string; }[]): Promise<TestResultDetail[]> {
    const model = 'gemini-3-pro-preview'; // Complex analysis for bulk feedback
    const frameworks = getFrameworks();
    const prompt = `Beoordeel de volgende set van interacties uit een eindtoets voor een Social Work student. Voor elke interactie, geef een beoordeling, een korte onderbouwing en een feedbacktip.
    
Antwoord in een JSON-array van objecten met de structuur:
[
  {
    "skill": "...",
    "clientStatement": "...",
    "studentResponse": "...",
    "assessment": "Onvoldoende" | "Voldoende" | "Goed",
    "justification": "De onderbouwing van de beoordeling.",
    "feedback": "Een concrete tip voor verbetering."
  },
  ...
]

Hier zijn de interacties en de kaders:
${answers.map((ans, i) => `
---
Interactie ${i + 1}:
Vaardigheid: "${ans.skill}"
Cliënt zei: "${ans.clientStatement}"
Student antwoordde: "${ans.studentResponse}"
Feedback Kader: ${frameworks[ans.skill]}
---
`).join('\n')}
`;
    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        const results: TestResultDetail[] = JSON.parse(response.text.trim());
        const sanitizedResults = results.map(res => ({
            ...res,
            assessment: sanitizeAssessment(res.assessment),
        }));
        return sanitizedResults.map((res, i) => ({ ...answers[i], ...res }));
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting bulk technique feedback:", error);
        return answers.map(ans => ({ ...ans, assessment: "Onvoldoende", justification: "Fout bij analyse.", feedback: "Kon geen feedback genereren." }));
    }
}

export async function getCoachingTip(skill: string, clientStatement: string): Promise<string> {
    const model = 'gemini-3-pro-preview'; // Better reasoning for helpful tips
    const prompt = `Een student Social Work oefent de vaardigheid "${skill}" en moet reageren op de volgende uitspraak van een cliënt: "${clientStatement}". Geef één korte, concrete tip die de student op weg helpt. Geef geen volledig antwoord, maar een hint. Bijvoorbeeld: "Probeer de emotie te benoemen die je hoort." of "Start je vraag eens met 'Wat' of 'Hoe'."`;
    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({ model, contents: prompt }));
        return response.text;
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting coaching tip:", error);
        return "Let goed op de kern van wat de cliënt zegt.";
    }
}

export async function getAIResponseForTest(conversation: Message[], nextSkill: string): Promise<{ responseText: string; nonVerbalCue: string; }> {
    const model = 'gemini-2.5-flash'; // Chat response needs to be fast
    const chatHistory = formatChatHistory(conversation);
    const prompt = `Dit is een rollenspel voor een Social Work student. De student voert een gesprek en moet als volgende de vaardigheid "${nextSkill}" toepassen.
Huidig gesprek:
${chatHistory}
Jouw taak: Geef een realistische reactie als cliënt die de student de perfecte gelegenheid geeft om "${nextSkill}" toe te passen. Genereer ook een passend non-verbaal signaal.
Antwoord in JSON formaat: {"responseText": "...", "nonVerbalCue": "..."}`;

    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting AI response for test:", error);
        return { responseText: "Oké, en verder?", nonVerbalCue: "Kijkt je afwachtend aan." };
    }
}

export async function getPersonalizedTestSequence(userKey: string): Promise<string[]> {
    const baseSequence = ['Open vragen stellen', 'Parafraseren', 'Gevoelsreflectie', 'Samenvatten'];
    try {
        const reports = getReports(userKey).filter(r => r.moduleKey === 'onderdeel1_eindtoets' && Array.isArray(r.data));
        if (reports.length === 0) return baseSequence;

        const skillScores: Record<string, { total: number; bad: number }> = {};
        baseSequence.forEach(s => { skillScores[s] = { total: 0, bad: 0 }; });

        for (const report of reports) {
            for (const detail of report.data as TestResultDetail[]) {
                if (skillScores[detail.skill]) {
                    skillScores[detail.skill].total++;
                    if (detail.assessment === 'Onvoldoende') {
                        skillScores[detail.skill].bad++;
                    }
                }
            }
        }
        
        const sortedSkills = baseSequence.sort((a, b) => {
            const scoreA = skillScores[a].total === 0 ? 0 : skillScores[a].bad / skillScores[a].total;
            const scoreB = skillScores[b].total === 0 ? 0 : skillScores[b].bad / skillScores[b].total;
            return scoreB - scoreA; // Sort descending by failure rate
        });
        
        return sortedSkills;
    } catch (error) {
        console.error("Error personalizing test sequence:", error);
        return baseSequence;
    }
}


export async function getDynamicClientResponse(conversation: Message[], scenario: any, nextStepIndex: number, userResponse: string): Promise<{ responseText: string, nonVerbalCue: string }> {
    const model = 'gemini-2.5-flash'; // Chat response needs to be fast
    const chatHistory = formatChatHistory(conversation);
    const nextStep = scenario.steps[nextStepIndex];
    
    const prompt = `Je bent een AI-cliënt in een rollenspel. De student volgt een scenario.
Scenario Context: ${scenario.introduction.description}
Huidig gesprek:
${chatHistory}
De student heeft zojuist gereageerd op jouw vorige uitspraak. De volgende 'geplande' uitspraak van jou in het script is: "${nextStep.clientStatement}" met als non-verbaal signaal "${nextStep.nonVerbalCue}".

Jouw taak: Geef een natuurlijke, korte overgangsreactie die de studentreactie verbindt met jouw volgende geplande uitspraak. Reageer bijvoorbeeld bevestigend ("Ja, precies, en dat...") en ga dan verder met je script. Gebruik het geplande non-verbale signaal.
Antwoord in JSON: {"responseText": "...", "nonVerbalCue": "..."}`;

    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model, contents: prompt, config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting dynamic client response:", error);
        return { responseText: nextStep.clientStatement, nonVerbalCue: nextStep.nonVerbalCue };
    }
}

export async function getBulkMiniCaseFeedback(answers: MiniCaseTestAnswer[]): Promise<TestResultDetail[]> {
    const model = 'gemini-3-pro-preview'; // Use powerful model for nuanced LSD feedback
    const framework = getFrameworks()['Actief luisteren'];
    
    const prompt = `Beoordeel de volgende set van interacties uit een eindtoets waarin de student de LSD-methode (Luisteren, Samenvatten, Doorvragen) moet toepassen in één reactie.
    
Feedback Kader: ${framework}

Voor elke interactie, beoordeel of de student alle drie de componenten (L, S, D) correct en logisch samenhangend toepast.
Antwoord in een JSON-array van objecten met de structuur:
[
  {
    "skill": "Actief luisteren (LSD)",
    "clientStatement": "...",
    "studentResponse": "...",
    "assessment": "Onvoldoende" | "Voldoende" | "Goed",
    "justification": "Onderbouw waarom de LSD-toepassing (on)voldoende of goed was. Benoem de L, S, en D componenten.",
    "feedback": "Een concrete tip voor verbetering."
  },
  ...
]

Hier zijn de interacties:
${answers.map((ans, i) => `
---
Interactie ${i + 1}:
Cliënt zei: "${ans.clientStatement}" (Non-verbaal: ${ans.nonVerbalCue})
Student antwoordde: "${ans.studentResponse}"
---
`).join('\n')}
`;
    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model, contents: prompt, config: { responseMimeType: "application/json" }
        }));
        const results: Omit<TestResultDetail, 'skill' | 'clientStatement' | 'studentResponse'>[] = JSON.parse(response.text.trim());
        return results.map((res, i) => ({
            ...answers[i],
            skill: "Actief luisteren (LSD)",
            assessment: sanitizeAssessment(res.assessment),
            justification: res.justification,
            feedback: res.feedback,
        }));
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting bulk mini case feedback:", error);
        return answers.map(ans => ({ ...ans, skill: "Actief luisteren (LSD)", assessment: "Onvoldoende", justification: "Fout bij analyse.", feedback: "Kon geen feedback genereren." }));
    }
}

export async function getLSDComponentFeedback(component: 'L' | 'S' | 'D', clientStatement: string, studentResponse: string): Promise<TechniqueFeedback> {
    const skillMap = {
        'L': 'Luister-signaal',
        'S': 'Samenvatten',
        'D': 'Doorvragen'
    };
    const skill = skillMap[component];
    const framework = getFrameworks()[skill];

    let instruction = '';
    if (component === 'L') {
        instruction = 'Beoordeel of dit een kort, neutraal en bevestigend luister-signaal is.';
    } else if (component === 'S') {
        instruction = `Beoordeel of dit een goede, beknopte samenvatting is die de kern van de boodschap weergeeft.`;
    } else {
        instruction = `Beoordeel of dit een goede, open en verdiepende vraag is die logisch volgt op de boodschap van de cliënt.`;
    }

    const prompt = `De student oefent de LSD-deelvaardigheid "${skill}".
Cliënt zei: "${clientStatement}"
Student antwoordde: "${studentResponse}"
Jouw taak: ${instruction} Gebruik dit kader:
${framework}
Geef een beoordeling ("Onvoldoende", "Voldoende", "Goed") en concrete feedback. De feedback moet een volledige beoordeling zijn op basis van het kader, maar houd het beknopt, maximaal twee alinea's.
Antwoord in JSON-formaat: {"assessment": "...", "feedback": "..."}`;

    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Higher quality feedback for training
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        const parsed = JSON.parse(response.text.trim());
        if (typeof parsed.feedback === 'string') {
            return {
                assessment: sanitizeAssessment(parsed.assessment),
                feedback: parsed.feedback
            };
        }
        throw new Error("Invalid JSON structure");
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting LSD component feedback:", error);
        return { assessment: "Onvoldoende", feedback: "Kon feedback niet genereren." };
    }
}

export async function getAIResponseForLSDTest(conversation: Message[]): Promise<{ responseText: string, nonVerbalCue: string }> {
    const model = 'gemini-2.5-flash'; // Chat response needs to be fast
    const chatHistory = formatChatHistory(conversation);
    const prompt = `Je bent een AI-cliënt in een rollenspel. Een student Social Work voert een verkennend gesprek met je.
Huidig gesprek:
${chatHistory}
Jouw taak: Geef een realistische, conversationele reactie. Zorg ervoor dat je reactie inhoud en emotie bevat, zodat de student de LSD-methode (Luisteren, Samenvatten, Doorvragen) kan blijven toepassen. Genereer ook een passend non-verbaal signaal.
Antwoord in JSON formaat: {"responseText": "...", "nonVerbalCue": "..."}`;

    try {
        const response: GenerateContentResponse = await callGeminiWithRetry(() => ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text.trim());
    } catch (error) {
        if ((error as Error).message === 'SYSTEM_BUSY') throw error;
        console.error("Error getting AI response for LSD test:", error);
        return { responseText: "Ja, dat klopt wel. En dat is soms best lastig.", nonVerbalCue: "Knikt instemmend." };
    }
}
