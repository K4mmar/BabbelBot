
import React from 'react';
import type { View } from '../types';
import { 
    HomeIcon, 
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    QuestionMarkCircleIcon 
} from './IconComponents';
import { useAppContext } from '../AppContext';

const NumberedCircle: React.FC<{ number: number; isActive: boolean }> = ({ number, isActive }) => (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
        isActive 
        ? 'bg-primary-green text-white' 
        : 'bg-warm-gray-200 text-warm-gray-700'
    }`}>
      {number}
    </div>
);

const SidebarLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
      isActive
        ? 'bg-primary-green-light text-primary-green-dark font-bold'
        : 'text-warm-gray-600 hover:bg-warm-gray-100 hover:text-warm-gray-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { userName, userRole, currentView } = state;

  const onNavigate = (view: View) => dispatch({ type: 'NAVIGATE', payload: view });
  const onLogout = () => dispatch({ type: 'LOGOUT' });
  
  const isOnderdeel1Active = currentView === 'onderdeel1';
  const isOnderdeel2Active = currentView === 'onderdeel2';
  const isOnderdeel3Active = currentView === 'onderdeel3' || currentView === 'training_chat' || currentView === 'instructions' || currentView === 'hulpvraag_chat' || currentView === 'hulpvraag_report' || currentView === 'training_ended';

  return (
    <aside className="w-64 bg-warm-gray-50 border-r border-warm-gray-200 flex flex-col flex-shrink-0 h-full">
      <div className="p-4 border-b border-warm-gray-200">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="font-semibold text-warm-gray-800">{userName}</p>
                <p className="text-xs text-warm-gray-500 capitalize">{userRole}</p>
            </div>
        </div>
      </div>

      <nav className="flex-grow p-3 space-y-1">
        <SidebarLink
          icon={<HomeIcon className="w-5 h-5" />}
          label="Dashboard"
          isActive={currentView === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />

        <div>
            <p className="px-3 pt-4 pb-2 text-xs font-semibold text-warm-gray-400 uppercase tracking-wider">Trainingsprogramma</p>
            <div className="space-y-1">
                 <SidebarLink
                    icon={<NumberedCircle number={1} isActive={isOnderdeel1Active} />}
                    label="Basistechnieken"
                    isActive={isOnderdeel1Active}
                    onClick={() => onNavigate('onderdeel1')}
                />
                 <SidebarLink
                    icon={<NumberedCircle number={2} isActive={isOnderdeel2Active} />}
                    label="LSD-methode"
                    isActive={isOnderdeel2Active}
                    onClick={() => onNavigate('onderdeel2')}
                />
                 <SidebarLink
                    icon={<NumberedCircle number={3} isActive={isOnderdeel3Active} />}
                    label="Voer het gesprek"
                    isActive={isOnderdeel3Active}
                    onClick={() => onNavigate('onderdeel3')}
                />
            </div>
        </div>
      </nav>

      <div className="p-3 border-t border-warm-gray-200">
         <SidebarLink
            icon={<QuestionMarkCircleIcon className="w-5 h-5" />}
            label="Over de App"
            isActive={currentView === 'about'}
            onClick={() => onNavigate('about')}
        />
         {userRole === 'docent' && (
             <SidebarLink
                icon={<Cog6ToothIcon className="w-5 h-5" />}
                label="Docentinstellingen"
                isActive={currentView === 'teacher_settings'}
                onClick={() => onNavigate('teacher_settings')}
            />
         )}
        <SidebarLink
          icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />}
          label="Uitloggen"
          isActive={false}
          onClick={onLogout}
        />
      </div>
    </aside>
  );
};
