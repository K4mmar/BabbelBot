
import React from 'react';
import type { TestResultDetail, SkillAssessmentLevel } from '../types';

export const assessmentDisplayStyles: { [key in SkillAssessmentLevel]: string } = {
    "Goed": "bg-primary-green text-white",
    "Voldoende": "bg-amber-300 text-amber-900",
    "Onvoldoende": "bg-red-200 text-red-800"
};

const Quote: React.FC<{ label: string; text: string }> = ({ label, text }) => (
    <div>
        <p className="text-sm font-semibold text-warm-gray-800 mb-1">{label}</p>
        <blockquote className="bg-warm-gray-50 p-3 rounded-lg border border-warm-gray-200 text-sm text-warm-gray-700 italic">
            "{text}"
        </blockquote>
    </div>
);

const FeedbackBox: React.FC<{ title: string; text: string; borderColor: string; bgColor: string; titleColor: string }> = ({ title, text, borderColor, bgColor, titleColor }) => (
    <div className={`p-4 rounded-r-lg border-l-4 ${borderColor} ${bgColor}`}>
        <h4 className={`font-semibold ${titleColor} mb-1`}>{title}</h4>
        <p className="text-sm text-warm-gray-700">{text}</p>
    </div>
);

export const ReportDetailItem: React.FC<{ result: TestResultDetail }> = ({ result }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-warm-gray-200 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
            <h3 className="font-serif text-xl font-semibold text-warm-gray-800">{result.skill}</h3>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${assessmentDisplayStyles[result.assessment]} flex-shrink-0 ml-4`}>
                {result.assessment}
            </span>
        </div>
        <div className="space-y-4">
            <Quote label="Uitspraak cliënt:" text={result.clientStatement} />
            <Quote label="Jouw reactie:" text={result.studentResponse} />
            
            <FeedbackBox 
                title="Onderbouwing:" 
                text={result.justification}
                borderColor="border-accent-lime"
                bgColor="bg-accent-yellow-green-light"
                titleColor="text-warm-gray-800"
            />
             <FeedbackBox 
                title="Feedback Tip:" 
                text={result.feedback}
                borderColor="border-primary-green"
                bgColor="bg-primary-green-light"
                titleColor="text-primary-green-dark"
            />
        </div>
    </div>
);
