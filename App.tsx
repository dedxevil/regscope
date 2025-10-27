import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import CommandCenterPage from './components/CommandCenterPage';
import ChatWidget from './components/ChatWidget';

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return 'dark'; // Default to dark theme
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-spotify-dark text-gray-800 dark:text-gray-200 font-sans">
      {isLoggedIn ? (
        <>
          <CommandCenterPage 
            onLogout={handleLogout} 
            theme={theme} 
            onToggleTheme={handleToggleTheme} 
          />
          <ChatWidget theme={theme} />
        </>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;