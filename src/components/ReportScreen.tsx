import React from 'react';
import { useAppContext } from '../AppContext';
import type { TestResultDetail, SkillAssessmentLevel } from '../types';
import { TEST_RUBRIC, MINI_CASE_RUBRIC } from '../constants';
import { ClipboardCheckIcon } from './IconComponents';
import { ReportDetailItem } from './ReportComponents';

export const ReportScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { structuredReportData } = state;

    if (!structuredReportData) {
        return (
            <div className="text-center p-8">
                <p className="text-warm-gray-600">Geen rapportgegevens beschikbaar.</p>
                <button
                    onClick={() => dispatch({ type: 'NAVIGATE', payload: 'dashboard' })}
                    className="mt-4 px-6 py-2 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-colors"
                >
                    Terug naar Dashboard
                </button>
            </div>
        );
    }
    
    const { title, results, score, total, sourceView } = structuredReportData;
    
    const isOnderdeel1 = sourceView === 'onderdeel1';

    const getRubricContent = () => {
        if (isOnderdeel1) {
            for (const level in TEST_RUBRIC) {
                const { scoreRange } = TEST_RUBRIC[level];
                if (score >= scoreRange[0] && score <= scoreRange[1]) {
                    return TEST_RUBRIC[level];
                }
            }
            return TEST_RUBRIC.onvoldoende;
        } else { // Onderdeel 2
             if (title.includes('Eindtoets')) { // Mini-Toets logic
                const passMark = 0.66;
                if (total > 0 && score / total >= passMark) {
                     return { 
                        ...MINI_CASE_RUBRIC.voldoende, 
                        description: `Je hebt ${score} van de ${total} reacties correct en daarmee de toets behaald. Een solide prestatie!` 
                    };
                }
                return { 
                    ...MINI_CASE_RUBRIC.onvoldoende, 
                    description: `Je hebt ${score} van de ${total} reacties correct. Om te slagen heb je minimaal ${Math.ceil(total * passMark)} correcte reacties nodig.` 
                };
            } else { // Zelfstandige Oefening logic
                const passMark = 0.75;
                if (total === 0) return { ...MINI_CASE_RUBRIC.onvoldoende, description: "Er zijn geen antwoorden om te beoordelen." };
                if (score / total >= passMark) {
                    return { 
                        ...MINI_CASE_RUBRIC.voldoende, 
                        description: `Je hebt ${score} van de ${total} stappen correct doorlopen. Een prima resultaat!` 
                    };
                }
                const needed = Math.ceil(passMark * total);
                return { 
                    ...MINI_CASE_RUBRIC.onvoldoende, 
                    description: `Je hebt ${score} van de ${total} stappen correct. Probeer er minimaal ${needed} te halen om een voldoende te scoren.` 
                };
            }
        }
    };
    
    const rubricContent = getRubricContent();

    return (
        <div className="w-full space-y-8 animate-fade-in">
             <div className="text-center">
                <ClipboardCheckIcon className="w-20 h-20 text-primary-green mx-auto"/>
                <h1 className="text-3xl font-bold text-warm-gray-800 mt-4">{title}</h1>
                <p className="text-warm-gray-600">Hier is een overzicht van je prestaties.</p>
            </div>

            <div className={`p-6 rounded-2xl border-l-8 ${rubricContent.color}`}>
                <h2 className="text-2xl font-bold">{rubricContent.title} ({score}/{total})</h2>
                <p className="mt-2">{rubricContent.description}</p>
            </div>

            <div className="space-y-6">
                 <h3 className="text-2xl font-semibold text-warm-gray-700 border-b pb-3 mb-6">Details per vaardigheid</h3>
                {results.map((result, index) => (
                    <ReportDetailItem key={index} result={result} />
                ))}
            </div>
            
            <div className="text-center pt-4">
                <button
                  onClick={() => dispatch({ type: 'NAVIGATE', payload: sourceView })}
                  className="w-full max-w-xs mx-auto p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105"
                >
                  Afronden
                </button>
            </div>
        </div>
    );
}