import type { Report, TestResultDetail } from '../types';
import { FEEDBACK_FRAMEWORKS as defaultFrameworks } from '../feedbackFrameworks';

const getReportsStorageKey = (userKey: string) => `babbelbot_reports_${userKey}`;
const FRAMEWORKS_STORAGE_KEY = 'babbelbot_frameworks';
const API_KEY_STORAGE_KEY = 'babbelbot_custom_api_key';

// --- API Key Functions ---
export const getCustomApiKey = (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const saveCustomApiKey = (key: string): void => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
};

export const removeCustomApiKey = (): void => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
};

// --- Report Functions ---
export const getReports = (userKey: string): Report[] => {
    if (!userKey) return [];
    const savedReports = localStorage.getItem(getReportsStorageKey(userKey));
    return savedReports ? JSON.parse(savedReports) : [];
};

export const saveReport = (
    userKey: string,
    moduleKey: string,
    title: string,
    data: TestResultDetail[] | string,
    score?: number,
    total?: number
): void => {
    if (!userKey) return;
    const newReport: Report = {
        id: new Date().toISOString(),
        moduleKey,
        title,
        date: new Date().toLocaleString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        data,
        score,
        total,
    };

    const reports = getReports(userKey);
    reports.unshift(newReport); // Add new reports to the beginning of the list
    localStorage.setItem(getReportsStorageKey(userKey), JSON.stringify(reports));
};

// --- Framework Functions ---
export const getFrameworks = (): Record<string, string> => {
    const savedFrameworks = localStorage.getItem(FRAMEWORKS_STORAGE_KEY);
    try {
        if (savedFrameworks) {
            const parsed = JSON.parse(savedFrameworks);
            // Basic validation to ensure it's an object
            if (typeof parsed === 'object' && parsed !== null) {
                return { ...defaultFrameworks, ...parsed };
            }
        }
    } catch (e) {
        console.error("Failed to parse custom frameworks from localStorage", e);
    }
    return { ...defaultFrameworks };
};

export const saveFrameworks = (frameworks: Record<string, string>): void => {
    try {
        const frameworksJson = JSON.stringify(frameworks);
        localStorage.setItem(FRAMEWORKS_STORAGE_KEY, frameworksJson);
    } catch (e) {
        console.error("Failed to save frameworks to localStorage", e);
    }
};