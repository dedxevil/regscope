// FIX: Removed invalid frontmatter from the top of the file.
import React, { useState, useRef, useEffect } from 'react';
import type { Theme } from '../App';
import type { User } from '../types';

interface HeaderProps {
    onLogout: () => void;
    theme: Theme;
    onToggleTheme: () => void;
    onToggleMobileMenu?: () => void;
    currentUser: User;
}

const LogoutIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const SunIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ onLogout, theme, onToggleTheme, onToggleMobileMenu, currentUser }) => {

    return (
        <header className="bg-white dark:bg-spotify-light-dark shadow-md sticky top-0 z-20 flex-shrink-0">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={onToggleMobileMenu} className="lg:hidden p-2 rounded-full text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card mr-2">
                           <MenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 dark:text-spotify-gray">{currentUser.title}</p>
                        </div>
                        
                        <button
                            onClick={onToggleTheme}
                            className="p-2 rounded-full text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spotify-light-dark focus:ring-spotify-green"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                        
                        <button
                            onClick={onLogout}
                            className="flex items-center px-2 sm:px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spotify-light-dark focus:ring-spotify-green"
                        >
                            <LogoutIcon className="w-5 h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;