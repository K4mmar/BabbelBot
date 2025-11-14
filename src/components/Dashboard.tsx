import React, { useState, useEffect } from 'react';
import type { Report, TestResultDetail, SkillAssessmentLevel, View } from '../types';
import { getReports } from '../services/storageService';
import { TRAINING_PROGRAM, LSD_TRAINING_PROGRAM, TEST_RUBRIC, MINI_CASE_RUBRIC } from '../constants';
import { EyeIcon, LightBulbIcon, CheckCircleIcon } from './IconComponents';
import { useAppContext } from '../AppContext';
import { ReportDetailItem } from './ReportComponents';

const ReportModal: React.FC<{ report: Report; onClose: () => void }> = ({ report, onClose }) => {
    const isTestReport = Array.isArray(report.data);
    const isMarkdownReport = typeof report.data === 'string';

    const getRubricContent = (score: number, total: number) => {
        if (report.moduleKey === 'onderdeel1_eindtoets') {
            for (const level in TEST_RUBRIC) {
                const { scoreRange } = TEST_RUBRIC[level];
                if (score >= scoreRange[0] && score <= scoreRange[1]) {
                    return TEST_RUBRIC[level];
                }
            }
            return TEST_RUBRIC.onvoldoende;
        } else { // Onderdeel 2
             if (report.moduleKey === 'onderdeel2_eindtoets') {
                const passMark = 0.66;
                if (total > 0 && score / total >= passMark) return { ...MINI_CASE_RUBRIC.voldoende, description: `Je hebt ${score} van de ${total} reacties correct en daarmee de toets behaald.` };
                return { ...MINI_CASE_RUBRIC.onvoldoende, description: `Je hebt ${score} van de ${total} reacties correct. Minimaal ${Math.ceil(total * passMark)} is nodig om te slagen.` };
            } else { // Zelfstandige Oefening
                const passMark = 0.75;
                if (total === 0) return { ...MINI_CASE_RUBRIC.onvoldoende, description: "Geen antwoorden om te beoordelen." };
                if (score / total >= passMark) return { ...MINI_CASE_RUBRIC.voldoende, description: `Je hebt ${score} van de ${total} stappen correct doorlopen.` };
                const needed = Math.ceil(passMark * total);
                return { ...MINI_CASE_RUBRIC.onvoldoende, description: `Je hebt ${score} van de ${total} stappen correct. Minimaal ${needed} is nodig.` };
            }
        }
    };
    
    const rubricContent = (isTestReport && report.score !== undefined && report.total !== undefined) 
        ? getRubricContent(report.score, report.total) 
        : null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all animate-slide-in-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-warm-gray-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-warm-gray-800">{report.title}</h2>
                    <p className="text-sm text-warm-gray-500 mt-1">Rapport van {report.date}</p>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {rubricContent && (
                         <div className={`p-6 rounded-xl border-l-4 ${rubricContent.color}`}>
                            <h2 className="text-2xl font-bold">{rubricContent.title} ({report.score}/{report.total})</h2>
                            <p className="mt-2">{rubricContent.description}</p>
                        </div>
                    )}
                    
                    {isTestReport && (
                        <div>
                            <h3 className="text-xl font-semibold text-warm-gray-700 border-b pb-2 mb-4">Details per vaardigheid</h3>
                            <div className="space-y-4">
                                {(report.data as TestResultDetail[]).map((result, index) => (
                                    <ReportDetailItem key={index} result={result} />
                                ))}
                            </div>
                        </div>
                    )}

                    {isMarkdownReport && (
                        <div className="report-content" dangerouslySetInnerHTML={{ __html: report.data as string }} />
                    )}
                </div>

                <div className="p-4 bg-warm-gray-100 rounded-b-2xl flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-warm-gray-200 text-warm-gray-700 font-bold rounded-xl hover:bg-warm-gray-300 transition-colors"
                    >
                        Sluiten
                    </button>
                </div>
            </div>
        </div>
    );
};


const ReportList: React.FC<{ reports: Report[]; onSelectReport: (report: Report) => void }> = ({ reports, onSelectReport }) => {
    const reportGroups = [
        { title: 'Onderdeel 1: Basistechnieken', key: 'onderdeel1_eindtoets' },
        { title: 'Onderdeel 2: LSD-methode (Zelfstandig)', key: 'onderdeel2_zelfstandig' },
        { title: 'Onderdeel 2: LSD-methode (Eindtoets)', key: 'onderdeel2_eindtoets' },
        { title: 'Onderdeel 3: Voer het gesprek', key: 'onderdeel3' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-2xl font-bold text-warm-gray-800 mb-4">Rapportenarchief</h2>
            {reports.length === 0 ? (
                <p className="text-warm-gray-500">Nog geen rapporten beschikbaar. Voltooi een oefening of eindtoets om hier een rapport te zien.</p>
            ) : (
                <div className="space-y-6">
                    {reportGroups.map(group => {
                        const filteredReports = reports.filter(r => r.moduleKey === group.key);
                        if (filteredReports.length === 0) return null;
                        
                        return (
                            <div key={group.key}>
                                <h3 className="text-lg font-semibold text-warm-gray-700 border-b border-warm-gray-200 pb-2 mb-3">{group.title}</h3>
                                <ul className="space-y-2">
                                    {filteredReports.map(report => (
                                        <li key={report.id} className="flex items-center justify-between p-3 bg-warm-gray-50 rounded-xl hover:bg-warm-gray-100 transition-colors">
                                            <div>
                                                <p className="font-medium text-warm-gray-800">{report.title}</p>
                                                <p className="text-sm text-warm-gray-500">{report.date}</p>
                                            </div>
                                            <button onClick={() => onSelectReport(report)} className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white text-sm font-semibold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105">
                                                <EyeIcon className="w-4 h-4" /> Bekijk
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ProgressCard: React.FC<{
  title: string;
  status: string;
  onClick: () => void;
  isCompleted: boolean;
}> = ({ title, status, onClick, isCompleted }) => {
  const iconContainerClass = isCompleted
    ? 'bg-primary-green-light text-primary-green'
    : 'bg-amber-100 text-amber-500';
    
  const hoverBorderClass = isCompleted ? 'hover:border-primary-green' : 'hover:border-amber-400';

  const icon = isCompleted
    ? <CheckCircleIcon className="w-8 h-8" />
    : <LightBulbIcon className="w-8 h-8" />;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white p-6 rounded-2xl shadow-sm border flex items-start space-x-4 transition-all duration-200 hover:shadow-md ${hoverBorderClass} hover:-translate-y-1`}
    >
      <div className={`${iconContainerClass} p-3 rounded-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-warm-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-warm-gray-700 mt-1">{status}</p>
      </div>
    </button>
  );
};


export const Dashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { userName, userRole, userKey } = state;

    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const storageKey1 = `techniqueDrillProgress_${userName}_${userRole}`;
        const savedProgress1 = localStorage.getItem(storageKey1);
        if (savedProgress1) setProgress1(JSON.parse(savedProgress1));

        const storageKey2 = `lsdMethodProgress_${userName}_${userRole}`;
        const savedProgress2 = localStorage.getItem(storageKey2);
        if (savedProgress2) setProgress2(JSON.parse(savedProgress2));

        setReports(getReports(userKey));
    }, [userName, userRole, userKey]);

    const getStatus1 = () => {
        const total = TRAINING_PROGRAM.length;
        if (progress1 >= total) return "Voltooid";
        return `${progress1} / ${total} behaald`;
    };

    const getStatus2 = () => {
        const total = LSD_TRAINING_PROGRAM.length;
        if (progress2 >= total) return "Voltooid";
        return `${progress2} / ${total} behaald`;
    };

    const numConversations = reports.filter(r => r.moduleKey === 'onderdeel3').length;

    const isCompleted1 = progress1 >= TRAINING_PROGRAM.length;
    const isCompleted2 = progress2 >= LSD_TRAINING_PROGRAM.length;
    const isCompleted3 = numConversations > 0;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center pb-6 mb-8">
                <h1 className="text-4xl font-extrabold text-warm-gray-800 tracking-tight">Dashboard</h1>
                <p className="text-warm-gray-600 mt-2 text-lg">Jouw voortgang en rapporten in één overzicht.</p>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ProgressCard 
                        title="Basistechnieken" 
                        status={getStatus1()} 
                        onClick={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel1' })}
                        isCompleted={isCompleted1}
                    />
                    <ProgressCard 
                        title="LSD-methode" 
                        status={getStatus2()}
                        onClick={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel2' })}
                        isCompleted={isCompleted2}
                    />
                    <ProgressCard 
                        title="Voer het gesprek" 
                        status={`${numConversations} ${numConversations === 1 ? 'gesprek' : 'gesprekken'}`}
                        onClick={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel3' })}
                        isCompleted={isCompleted3}
                    />
                </div>
                
                <ReportList reports={reports} onSelectReport={setSelectedReport} />
            </div>

            {selectedReport && (
                <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
            )}
        </div>
    );
};
