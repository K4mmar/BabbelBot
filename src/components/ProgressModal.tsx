import React from 'react';
import type { Progress } from '../types';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  learningGoal: string;
  progress: Progress | null;
  isLoading: boolean;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, learningGoal, progress, isLoading }) => {
  if (!isOpen) return null;

  const goalTotal = parseInt(learningGoal.match(/\d+/)?.[0] ?? '1', 10);
  const progressPercentage = progress ? Math.min((progress.count / goalTotal) * 100, 100) : 0;


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 transform transition-all animate-slide-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div>
          <h2 className="text-2xl font-bold text-warm-gray-800">Jouw Voortgang</h2>
          <p className="text-sm text-warm-gray-500 mt-1">
            <strong>Leerdoel:</strong> {learningGoal}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
          </div>
        ) : (
          progress && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-medium text-warm-gray-700">Status:</span>
                  <span className="text-2xl font-bold text-primary-green">{progress.count} / {goalTotal}</span>
                </div>
                <div className="w-full bg-warm-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-accent-yellow-green to-accent-lime h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${progressPercentage}%` }}
                  >
                   {progressPercentage > 15 && <span className="text-white text-xs font-bold">{Math.round(progressPercentage)}%</span>}
                  </div>
                </div>
              </div>

              <div className="bg-primary-green-light border-l-4 border-primary-green p-4 rounded-r-lg">
                <h3 className="text-md font-semibold text-primary-green-dark mb-1">Feedback Tip:</h3>
                <p className="text-warm-gray-700">{progress.feedback}</p>
              </div>
            </>
          )
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 p-3 bg-warm-gray-200 text-warm-gray-700 font-bold rounded-xl hover:bg-warm-gray-300 transition-colors"
        >
          Sluiten
        </button>
      </div>
    </div>
  );
};