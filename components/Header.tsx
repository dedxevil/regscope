// FIX: Removed invalid frontmatter from the top of the file.
import React, { useState, useRef, useEffect } from 'react';
import type { Theme } from '../App';

interface HeaderProps {
    title: string;
    onLogout: () => void;
    theme: Theme;
    onToggleTheme: () => void;
    onToggleMobileMenu?: () => void;
    onRefreshCharts?: () => void;
    // FIX: Make auto-refresh props optional to support pages without this feature.
    autoRefreshInterval?: number;
    onSetAutoRefreshInterval?: (interval: number) => void;
    refreshCountdown?: number | null;
}

const ShieldIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V6.3l7-3.11v10.8z" />
    </svg>
);

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

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="-1.5 -2.5 24 24" preserveAspectRatio="xMinYMin">
        <path d='M17.83 4.194l.42-1.377a1 1 0 1 1 1.913.585l-1.17 3.825a1 1 0 0 1-1.248.664l-3.825-1.17a1 1 0 1 1 .585-1.912l1.672.511A7.381 7.381 0 0 0 3.185 6.584l-.26.633a1 1 0 1 1-1.85-.758l.26-.633A9.381 9.381 0 0 1 17.83 4.194zM2.308 14.807l-.327 1.311a1 1 0 1 1-1.94-.484l.967-3.88a1 1 0 0 1 1.265-.716l3.828.954a1 1 0 0 1-.484 1.941l-1.786-.445a7.384 7.384 0 0 0 13.216-1.792 1 1 0 1 1 1.906.608 9.381 9.381 0 0 1-5.38 5.831 9.386 9.386 0 0 1-11.265-3.328z' />
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ title, onLogout, theme, onToggleTheme, onToggleMobileMenu, onRefreshCharts, autoRefreshInterval, onSetAutoRefreshInterval, refreshCountdown }) => {
    const [isRefreshMenuOpen, setIsRefreshMenuOpen] = useState(false);
    const refreshMenuRef = useRef<HTMLDivElement>(null);

    const refreshOptions = [
        { label: 'Off', value: 0 },
        { label: '30s', value: 30000 },
        { label: '1m', value: 60000 },
        { label: '5m', value: 300000 },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (refreshMenuRef.current && !refreshMenuRef.current.contains(event.target as Node)) {
                setIsRefreshMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white dark:bg-spotify-light-dark shadow-md sticky top-0 z-20 flex-shrink-0">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={onToggleMobileMenu} className="md:hidden p-2 rounded-full text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card mr-2">
                           <MenuIcon className="w-6 h-6" />
                        </button>
                        <ShieldIcon className="w-8 h-8 text-blue-600 dark:text-spotify-green" />
                        <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100 hidden sm:block">ReguCheck</h1>
                         <span className="hidden lg:inline-block ml-4 text-xl text-gray-500 dark:text-spotify-gray font-light">| {title}</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Alex Green</p>
                            <p className="text-xs text-gray-500 dark:text-spotify-gray">Regulatory Affairs</p>
                        </div>

                        {refreshCountdown !== null && (
                            <div className="text-xs text-gray-500 dark:text-spotify-gray hidden lg:block">
                                (Auto-refresh in {refreshCountdown}s)
                            </div>
                        )}

                        {/* FIX: Conditionally render auto-refresh controls only if the functionality is provided */}
                        {onSetAutoRefreshInterval && (
                            <div className="relative" ref={refreshMenuRef}>
                                <button
                                    onClick={() => setIsRefreshMenuOpen(prev => !prev)}
                                    className="p-2 rounded-full text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spotify-light-dark focus:ring-spotify-green"
                                    aria-label="Set auto-refresh interval"
                                >
                                    <ClockIcon className="w-5 h-5" />
                                </button>
                                {isRefreshMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-spotify-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                                        <div className="py-1">
                                            <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-spotify-gray">Auto-Refresh</p>
                                            {refreshOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        onSetAutoRefreshInterval(opt.value);
                                                        setIsRefreshMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-spotify-light-dark flex justify-between items-center"
                                                >
                                                    {opt.label}
                                                    {autoRefreshInterval === opt.value && <CheckIcon className="w-4 h-4 text-spotify-green" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {onRefreshCharts && (
                            <button
                                onClick={onRefreshCharts}
                                className="p-2 rounded-full text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spotify-light-dark focus:ring-spotify-green"
                                aria-label="Refresh chart data"
                            >
                                <RefreshIcon className="w-5 h-5" />
                            </button>
                        )}
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
