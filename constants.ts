import type { TrainingLevel, LSDTrainingStep } from './types';

export const FIELDS_OF_WORK: string[] = [
  "Jeugdzorg",
  "Verslavingszorg",
  "Ouderenzorg",
  "Schuldhulpverlening",
  "Reclassering",
];

export const CASE_STUDIES: { [key: string]: string[] } = {
  "Jeugdzorg": ["Spijbelen en motivatieproblemen", "Conflict met ouders over regels", "Pestgedrag op sociale media"],
  "Verslavingszorg": ["Erkent beginnende alcoholverslaving niet", "Financiële problemen door gokken", "Sociale isolatie door drugsgebruik"],
  "Ouderenzorg": ["Gevoelens van eenzaamheid en isolatie", "Moeite met accepteren van hulp", "Angst voor afnemende zelfstandigheid"],
  "Schuldhulpverlening": ["Overzicht kwijt over financiën", "Schaamte over schulden", "Stress door deurwaarders"],
  "Reclassering": ["Moeite met vinden van werk na detentie", "Risico op terugval in oud gedrag", "Herstellen van contact met familie"],
};

export const CONVERSATIONAL_SKILLS: string[] = [
  "Open vragen stellen",
  "Parafraseren",
  "Gevoelsreflectie",
  "Samenvatten",
  "Actief luisteren",
];

export const SKILL_INSTRUCTIONS: { [key: string]: { title: string; description: string; tips: string[] } } = {
    "Open vragen stellen": {
        title: "Open Vragen Stellen",
        description: "Het doel van een open vraag is om de cliënt uit te nodigen een verhaal te vertellen. De AI beoordeelt je vraag op drie niveaus: 1. Is de vraag open? 2. Is de vraag doelgericht? 3. Is de vraag professioneel geformuleerd?",
        tips: [
            "Een vraag is 'open' als hij begint met 'Wat', 'Hoe', 'Wie', 'Welke' of 'Kunt u meer vertellen over...'.",
            "Zorg dat je vraag 'doelgericht' is en aansluit bij de casus en het verkennen van de leefwereld.",
            "Formuleer 'professioneel': stel één duidelijke vraag tegelijk en vermijd vakjargon.",
            "Let op: 'Waarom'-vragen kunnen beschuldigend overkomen. Gebruik liever 'Wat maakte dat...'."
        ]
    },
    "Parafraseren": {
        title: "Parafraseren (Inhoudsreflectie)",
        description: "Je geeft de feitelijke inhoud van de laatste uitspraak van de cliënt kort en in eigen woorden terug. De AI beoordeelt je parafrase op: 1. Is het een parafrase? 2. Is de kwaliteit goed? 3. Is de formulering professioneel?",
        tips: [
            "Een parafrase is een 'inhoudsreflectie', geen gevoelsreflectie of een vraag.",
            "De kwaliteit is goed als je parafrase 'beknopt' is (korter dan de cliënt) en in 'eigen woorden' (geen papegaaien).",
            "Formuleer 'professioneel' en 'tentatief' (voorzichtig), bijvoorbeeld: 'Dus als ik u goed begrijp, dan...'",
            "Houd het neutraal: voeg geen eigen mening of interpretatie toe."
        ]
    },
    "Gevoelsreflectie": {
        title: "Gevoelsreflectie",
        description: "Je benoemt de emotie die je waarneemt in de boodschap van de cliënt. De AI beoordeelt je reflectie op: 1. Is het een gevoelsreflectie? 2. Is de kwaliteit goed? 3. Is de formulering professioneel?",
        tips: [
            "Een gevoelsreflectie 'benoemt een emotie' (bv. 'boos', 'teleurgesteld'). Het is geen vraag ('Bent u boos?').",
            "De kwaliteit is goed als het 'gevoelsetiket' passend is en je het 'tentatief' brengt: 'Het klinkt alsof u zich...'",
            "De sterkste reflecties 'koppelen gevoel aan inhoud': 'U klinkt [gevoel], omdat [inhoud]'.",
            "Formuleer 'professioneel': wees empathisch en niet-oordelend. Vermijd 'Ik denk dat u...'"
        ]
    },
    "Samenvatten": {
        title: "Samenvatten",
        description: "Je bundelt de belangrijkste thema's en gevoelens uit een langer deel van het gesprek. De AI beoordeelt je samenvatting op: 1. Is het een samenvatting? 2. Is de kwaliteit goed? 3. Is de functie professioneel?",
        tips: [
            "Een samenvatting is 'breder dan een parafrase': je clustert meerdere onderwerpen of de rode draad.",
            "De kwaliteit is goed als de samenvatting 'compleet' is (de kern dekt) en in 'eigen woorden' is.",
            "De functie is 'professioneel' als je het gebruikt om structuur te bieden, begrip te checken of een overgang te maken.",
            "Breng het 'tentatief' om de cliënt uit te nodigen tot aanvulling: 'Klopt het dat we het hebben gehad over...?'"
        ]
    },
     "Actief luisteren": {
        title: "Actief luisteren",
        description: "Bij actief luisteren pas je de LSD-techniek toe. Je geeft één reactie die bestaat uit Luisteren, Samenvatten en Doorvragen. De AI beoordeelt of de drie onderdelen correct zijn en logisch op elkaar aansluiten.",
        tips: [
            "Luister niet alleen naar de feiten, maar ook naar de onderliggende gevoelens en behoeften.",
            "Vat kort samen wat je hoort (S) om te controleren of je het goed begrijpt. Bijvoorbeeld: 'Dus als ik het goed begrijp, maak je je zorgen over...'",
            "Vraag door (D) op wat de cliënt vertelt. Een goede vraag sluit direct aan op de samenvatting.",
            "Laat de regie bij de cliënt. Jouw rol is volgend, niet sturend.",
            "Vermijd oordelen, ongevraagde adviezen of het direct overnemen van het gesprek."
        ]
    }
};

export const LEARNING_GOALS: { [key: string]: string[] } = {
    "Samenvatten": [
        "Ik vat het gesprek 1 keer halverwege samen.",
        "Ik vat de kern van het probleem aan het einde van het gesprek samen."
    ],
    "Parafraseren": [
        "Ik parafraseer een belangrijke uitspraak van de cliënt 2 keer.",
        "Ik parafraseer de zorgen van de cliënt 3 keer gedurende het gesprek."
    ],
    "Open vragen stellen": [
        "Ik stel 3 open vragen om het verhaal te verdiepen.",
        "Ik stel 5 open vragen die beginnen met 'Hoe' of 'Wat'."
    ],
    "Gevoelsreflectie": [
        "Ik reflecteer 2 keer een gevoel dat de cliënt benoemt.",
        "Ik reflecteer 3 keer op een gevoel, waarvan één keer gebaseerd op non-verbale signalen (die de AI zal beschrijven)."
    ]
};

export const TRAINING_PROGRAM: TrainingLevel[] = [
    { skill: "Open vragen stellen", goal: 3, description: "Leer hoe je het gesprek opent en verdiept." },
    { skill: "Gevoelsreflectie", goal: 3, description: "Benoem de emoties achter het verhaal van de cliënt." },
    { skill: "Parafraseren", goal: 3, description: "Controleer je begrip door de boodschap te herformuleren." },
    { skill: "Samenvatten", goal: 2, description: "Bundel de kern van het gesprek om overzicht te creëren." },
    { skill: "Eindtoets", goal: 4, description: "Test je vaardigheden in een gemixte toets van 4 vragen." },
];

export const LSD_TRAINING_PROGRAM: LSDTrainingStep[] = [
    { step: 1, type: 'guided', skill: 'L', title: 'Luister-signaal Geven', description: 'Oefen met het geven van korte, bevestigende signalen.' },
    { step: 2, type: 'guided', skill: 'S', title: 'Samenvatten', description: 'Oefen met de kern van de boodschap teruggeven.' },
    { step: 3, type: 'guided', skill: 'D', title: 'Doorvragen', description: 'Oefen met het stellen van open vragen die verdiepen.' },
    { step: 4, type: 'independent', skill: 'independent', title: 'Zelfstandige Oefening', description: 'Doorloop een scenario zonder hulp en ontvang een rapport.' },
    { step: 5, type: 'test', skill: 'test', title: 'Eindtoets', description: 'Voer een gesprek van 6 beurten en ontvang een eindbeoordeling.' },
];

export const TEST_RUBRIC: { [key: string]: { title: string; description: string; scoreRange: [number, number]; color: string } } = {
    onvoldoende: {
        title: "Onvoldoende",
        description: "Je hebt bij twee of meer vaardigheden nog moeite met de correcte toepassing. Herhaal de losse oefeningen om meer zekerheid te krijgen.",
        scoreRange: [0, 2],
        color: "bg-red-100 border-red-500 text-red-800"
    },
    voldoende: {
        title: "Voldoende",
        description: "Je beheerst de meeste basisvaardigheden. Er is nog wat ruimte voor verfijning, maar de basis is solide.",
        scoreRange: [3, 3],
        color: "bg-amber-100 border-amber-500 text-amber-800"
    },
    goed: {
        title: "Goed",
        description: "Uitstekend werk! Je herkent de situaties goed en past alle verschillende vaardigheden effectief en correct toe.",
        scoreRange: [4, 4],
        color: "bg-primary-green-light border-primary-green text-primary-green-dark"
    }
};

export const MINI_CASE_RUBRIC: { [key: string]: { title: string; color: string } } = {
    onvoldoende: {
        title: "Onvoldoende",
        color: "bg-red-100 border-red-500 text-red-800"
    },
    voldoende: {
        title: "Voldoende",
        color: "bg-amber-100 border-amber-500 text-amber-800"
    },
    goed: {
        title: "Goed",
        color: "bg-primary-green-light border-primary-green text-primary-green-dark"
    }
};

export const MINI_CASE_SCENARIOS = [
  // Scenario 1: Overweldigde student
  {
    skill: "Actief luisteren",
    title: "Mini-Casus: De kern van aandacht",
    introduction: {
        title: "Welkom bij de mini-casus 'Actief Luisteren'.",
        description: "In dit scenario oefen je de basis van elk goed gesprek door de LSD-techniek (Luisteren, Samenvatten, Doorvragen) toe te passen. Bij elke uitspraak van de cliënt geef je een driedelige reactie. Succes!",
    },
    steps: [
        {
            clientStatement: "Nou ja, het gaat dus niet zo lekker de laatste tijd. Alles is gewoon... een beetje te veel. School, werk, thuis... het loopt allemaal door elkaar en ik trek het gewoon niet meer zo goed.",
            nonVerbalCue: "De cliënt zakt wat onderuit in haar stoel en vermijdt oogcontact terwijl ze dit zegt.",
            coachingTip: "L: Geef een kort, bevestigend luister-signaal (bv. 'Oké', 'Ik hoor je'). S: Vat de kern samen: ze ervaart alles als 'te veel' en voelt zich neerslachtig. D: Vraag door op wat 'te veel' voor haar betekent met een open vraag."
        },
        {
            clientStatement: "Precies, het is gewoon te veel. En het voelt alsof niemand dat ziet. Gisteren zei mijn moeder nog: 'Zet je er gewoon even overheen'. Dat maakte me zo kwaad en tegelijkertijd ook zo moedeloos.",
            nonVerbalCue: "Je ziet haar ogen waterig worden bij het woord 'moedeloos'.",
            coachingTip: "L: Toon begrip voor de frustratie. S: Reflecteer op het gevoel van onbegrip en moedeloosheid dat de opmerking van haar moeder veroorzaakte. Koppel gevoel aan de situatie. D: Vraag open door naar wat de opmerking met haar deed."
        },
        {
            clientStatement: "Ja, precies. Het is alsof ik er alleen voor sta. Iedereen heeft het druk en ik wil ook niemand tot last zijn, snap je?",
            nonVerbalCue: "Er valt een korte stilte en ze kijkt je voor het eerst even recht aan.",
            coachingTip: "L: Erken de stilte en het directe oogcontact. S: Vat de kern samen: ze voelt zich alleen en wil anderen niet belasten. D: Vraag door naar wat 'niemand tot last zijn' voor haar inhoudt. Dit is een belangrijk thema."
        },
        {
            clientStatement: "Nou, ik merk dat ik steeds vaker afspraken met vrienden afzeg. Ik heb er gewoon de energie niet voor. Dan zeg ik maar dat ik moet werken, maar eigenlijk zit ik gewoon alleen thuis op de bank.",
            nonVerbalCue: "Ze zegt dit op een zachte, bijna fluisterende toon.",
            coachingTip: "L: Geef een rustig luister-signaal. S: Vat het concrete gedrag (afspraken afzeggen) en het gevolg (alleen zijn) samen. D: Vraag door naar wat dit gedrag (het afzeggen) met haar doet, of wat ze mist."
        }
    ],
    completion: {
        title: "Uitstekend geluisterd!",
        description: "Je hebt de mini-casus voltooid. Je hebt laten zien dat je gestructureerd kunt luisteren door de LSD-techniek consequent toe te passen. Dit is de fundering waarop je alle andere gesprekstechnieken bouwt."
    }
  },
  // Scenario 2: Conflict op het werk
  {
    skill: "Actief luisteren",
    title: "Mini-Casus: Bemiddelen in conflict",
    introduction: {
        title: "Welkom bij de mini-casus 'Bemiddelen in conflict'.",
        description: "Je spreekt een cliënt die een conflict heeft op het werk. De emoties lopen hoog op. Jouw taak is om door de LSD-techniek toe te passen de situatie te de-escaleren en de kern van het probleem helder te krijgen.",
    },
    steps: [
        {
            clientStatement: "Ik ben er zó klaar mee. Mijn collega levert constant zijn werk te laat aan en ik ben degene die er de klachten over krijgt van de teamleider. Ik heb het gevoel dat ik alles alleen moet doen.",
            nonVerbalCue: "De cliënt spreekt met stemverheffing en heeft zijn armen over elkaar geslagen.",
            coachingTip: "L: Erken de frustratie. S: Vat de feitelijke situatie samen: de collega levert te laat, de cliënt krijgt de klachten en voelt zich alleen staan. D: Vraag door naar wat de impact hiervan op hem is."
        },
        {
            clientStatement: "Ja, en als ik er iets van zeg, doet hij alsof zijn neus bloedt. Hij zegt 'ja, ja, komt goed', maar er verandert niets. Het voelt zo oneerlijk, ik werk me rot en hij... niks.",
            nonVerbalCue: "Hij balt zijn vuisten als hij over zijn collega praat.",
            coachingTip: "L: Geef een kort signaal van begrip. S: Reflecteer op het gevoel van onrechtvaardigheid en de machteloosheid die hij ervaart. D: Vraag door naar wat hij al heeft geprobeerd om dit aan te pakken."
        },
        {
            clientStatement: "Precies, oneerlijk is het. Ik heb het ook al eens aangekaart bij mijn teamleider, maar die zegt alleen maar 'dat moeten jullie onderling oplossen'. Ik voel me totaal niet gesteund.",
            nonVerbalCue: "Zijn schouders zakken wat in en zijn stem klinkt nu eerder teleurgesteld dan boos.",
            coachingTip: "L: Erken de teleurstelling. S: Vat de kern samen: hij voelt zich niet gesteund door zijn teamleider. D: Vraag open door naar wat 'gesteund voelen' voor hem zou betekenen in deze situatie."
        },
        {
            clientStatement: "Nou, dat ik er dus alleen voor sta. Ik weet gewoon niet meer wat ik moet doen. Moet ik weer naar mijn teamleider? Moet ik boos worden op mijn collega? Ik zie geen oplossing.",
            nonVerbalCue: "Hij kijkt je aan met een vragende, bijna wanhopige blik.",
            coachingTip: "L: Geef een rustig luister-signaal. S: Vat zijn dilemma samen: hij weet niet welke stap hij moet zetten en voelt zich machteloos. D: Vraag door naar wat hij hoopt dat een eerste, kleine stap zou kunnen zijn."
        }
    ],
    completion: {
        title: "Goed bemiddeld!",
        description: "Je hebt de mini-casus voltooid. Door rustig en gestructureerd te luisteren met de LSD-techniek, heb je de angel uit de eerste frustratie gehaald en de situatie helderder gemaakt."
    }
  },
  // Scenario 3: Zorgen om een familielid
  {
    skill: "Actief luisteren",
    title: "Mini-Casus: Zorgen om een ander",
    introduction: {
        title: "Welkom bij de mini-casus 'Zorgen om een ander'.",
        description: "Je spreekt een cliënt die zich grote zorgen maakt om haar ouder. Jouw taak is om met de LSD-techniek haar verhaal helder te krijgen en haar het gevoel te geven dat ze gehoord wordt in haar zorgen.",
    },
    steps: [
        {
            clientStatement: "Het gaat over mijn vader. Hij wordt vergeetachtig en is de laatste tijd al twee keer gevallen. Maar hij wil absoluut geen hulp accepteren. Hij wordt boos als ik erover begin.",
            nonVerbalCue: "De cliënt friemelt onrustig aan haar tas terwijl ze praat.",
            coachingTip: "L: Geef een kort signaal van begrip. S: Vat de feiten samen: de zorgen om haar vader (vergeetachtig, vallen) en zijn weerstand tegen hulp. D: Vraag open door naar wat deze situatie met de cliënt doet."
        },
        {
            clientStatement: "Inderdaad. En ik voel me zo machteloos. Ik lig er 's nachts wakker van. Wat als hij weer valt en niemand kan bereiken? Die gedachte maakt me gek.",
            nonVerbalCue: "Ze wrijft over haar voorhoofd en haar ademhaling gaat sneller.",
            coachingTip: "L: Erken de stress die je ziet. S: Reflecteer op het gevoel van machteloosheid en de angst die haar 's nachts wakker houdt. D: Vraag door naar waar ze het meest bang voor is dat er gebeurt."
        },
        {
            clientStatement: "Ja, machteloos is het juiste woord. En ik voel me ook schuldig of zo. Ik heb het gevoel dat ik meer moet doen, maar ik weet niet wat. Ik wil zijn autonomie ook respecteren.",
            nonVerbalCue: "Ze kijkt naar buiten, alsof ze daar een antwoord zoekt.",
            coachingTip: "L: Geef een rustig luister-signaal. S: Vat haar innerlijke conflict samen: de drang om te helpen versus het respecteren van zijn autonomie, wat leidt tot een schuldgevoel. D: Vraag door naar wat 'zijn autonomie respecteren' voor haar betekent."
        },
        {
            clientStatement: "Ik weet het niet... Ik bel hem nu elke dag, maar dat voelt als controleren. Hij wordt er kribbig van en ik word er gestrest van. Het is een negatieve spraal waar we in zitten.",
            nonVerbalCue: "Ze zucht en haalt haar schouders op, een gebaar van opgeven.",
            coachingTip: "L: Erken de zucht. S: Vat de 'negatieve spraal' samen: haar poging tot zorg (bellen) leidt tot stress bij beiden. D: Vraag door naar wat er volgens haar zou moeten veranderen om die spiraal te doorbreken."
        }
    ],
    completion: {
        title: "Sterk geluisterd!",
        description: "Je hebt deze casus voltooid. Je hebt goed laten zien dat je de focus kunt leggen op de gevoelens van de cliënt zelf door gestructureerd de LSD-techniek toe te passen. Dit is een essentiële vaardigheid."
    }
  }
];