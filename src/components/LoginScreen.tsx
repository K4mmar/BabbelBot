import React, { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  role: 'student' | 'docent';
}

interface LoginScreenProps {
  onStart: (name: string, role: 'student' | 'docent') => void;
  onLogin: (name: string, role: 'student' | 'docent') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onStart, onLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'docent' | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  useEffect(() => {
    const savedProfiles = localStorage.getItem('userProfiles');
    if (savedProfiles) {
      const parsedProfiles: UserProfile[] = JSON.parse(savedProfiles);
      setProfiles(parsedProfiles);
      if (parsedProfiles.length === 0) {
        setShowNewUserForm(true);
      }
    } else {
      setShowNewUserForm(true);
    }
  }, []);

  const handleStart = () => {
    if (name.trim() && role) {
      onStart(name.trim(), role);
    }
  };
  
  const getRoleButtonStyle = (selectedRole: 'student' | 'docent') => {
      const baseStyle = "w-full p-4 rounded-xl border-2 font-semibold transition-all duration-200 flex flex-col items-center space-y-2";
      if (role === selectedRole) {
          return `${baseStyle} bg-primary-green border-primary-green text-white shadow-lg`;
      }
      return `${baseStyle} bg-white border-warm-gray-300 text-warm-gray-700 hover:border-accent-lime hover:bg-accent-yellow-green-light`;
  }

  const renderNewUserForm = () => (
    <>
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4">
          <img src="https://sudoku.synology.me/images/logobabbelbot.png" alt="BabbelBot Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-warm-gray-800">Welkom bij BabbelBot</h1>
        <p className="text-warm-gray-600 mt-2">Stel jezelf even voor.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-warm-gray-700 mb-1">
            Wat is je naam?
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Voer je naam in"
            className="w-full p-3 bg-white border border-warm-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-lime transition text-warm-gray-900"
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-warm-gray-700 mb-2">
            Wat is je rol?
          </span>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole('student')}
              className={getRoleButtonStyle('student')}
            >
              <span className="text-xl">🎓</span>
              <span>Student</span>
            </button>
            <button
              onClick={() => setRole('docent')}
              className={getRoleButtonStyle('docent')}
            >
              <span className="text-xl">🧑‍🏫</span>
              <span>Docent</span>
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <button
            onClick={handleStart}
            disabled={!name.trim() || !role}
            className="w-full p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark disabled:bg-warm-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
            Verder
        </button>
        {profiles.length > 0 && (
            <button onClick={() => setShowNewUserForm(false)} className="w-full p-2 text-sm text-warm-gray-600 hover:text-black transition-colors">
                Terug naar profielkeuze
            </button>
        )}
      </div>
    </>
  );
  
  const renderProfileSelection = () => (
     <>
        <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4">
              <img src="https://sudoku.synology.me/images/logobabbelbot.png" alt="BabbelBot Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-warm-gray-800">Kies je profiel</h1>
            <p className="text-warm-gray-600 mt-2">Ga verder waar je gebleven was.</p>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {profiles.map((profile, index) => (
                <button 
                    key={index} 
                    onClick={() => onLogin(profile.name, profile.role)} 
                    className="w-full text-left p-4 rounded-xl border-2 border-warm-gray-200 bg-white hover:bg-accent-yellow-green-light hover:border-accent-lime transition-all flex items-center space-x-4 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`}}
                >
                    <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-warm-gray-800">{profile.name}</p>
                        <p className="text-sm text-warm-gray-500 capitalize">{profile.role}</p>
                    </div>
                </button>
            ))}
        </div>
        <button onClick={() => setShowNewUserForm(true)} className="w-full p-3 bg-warm-gray-200 text-warm-gray-700 font-bold rounded-xl hover:bg-warm-gray-300 transition-colors">
            Andere gebruiker
        </button>
     </>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-6">
      {showNewUserForm ? renderNewUserForm() : renderProfileSelection()}
    </div>
  );
};