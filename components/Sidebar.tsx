import React from 'react';
import type { User, AppView } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: User;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V6.3l7-3.11v10.8z" /></svg>;
const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CollapseLeftIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>);
const ExpandRightIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>);
const CloseIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);

const NavItem: React.FC<{ view: AppView; label: string; icon: React.ReactNode; isCollapsed: boolean; isActive: boolean; onClick: () => void }> = ({ view, label, icon, isCollapsed, isActive, onClick }) => {
  return (
    <li className="px-3">
      <button
        onClick={onClick}
        className={`w-full flex items-center h-12 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600/10 dark:bg-spotify-green/10 text-blue-600 dark:text-spotify-green' : 'text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card'}`}
        title={isCollapsed ? label : ''}
      >
        <span className={`flex-shrink-0 w-12 flex items-center justify-center`}>{icon}</span>
        {!isCollapsed && <span className="font-semibold">{label}</span>}
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, currentUser, currentView, onNavigate, isMobile, onClose }) => {
  const allRoles = ['admin', 'product_manager', 'compliance_manager', 'logistics'];
  const navItems = [
    { view: 'ingredient_dashboard' as AppView, label: 'Ingredient Dashboard', icon: <DashboardIcon className="w-6 h-6" />, roles: allRoles },
    { view: 'product_dashboard' as AppView, label: 'Product Dashboard', icon: <BriefcaseIcon className="w-6 h-6" />, roles: allRoles },
    { view: 'search' as AppView, label: 'Search', icon: <SearchIcon className="w-6 h-6" />, roles: allRoles },
    { view: 'regulatory_documents' as AppView, label: 'Regulatory Documents', icon: <DocumentIcon className="w-6 h-6" />, roles: ['admin'] },
    { view: 'settings' as AppView, label: 'Settings', icon: <SettingsIcon className="w-6 h-6" />, roles: allRoles },
  ];

  return (
    <div className={`flex flex-col bg-white dark:bg-spotify-light-dark shadow-lg transition-all duration-300 ${isCollapsed && !isMobile ? 'w-24' : 'w-64'}`}>
      <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 shrink-0 ${isCollapsed && !isMobile ? 'justify-center' : 'px-4'}`}>
        {isCollapsed && !isMobile ? (
            <ShieldIcon className="w-8 h-8 text-blue-600 dark:text-spotify-green" />
        ) : (
            <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                    <ShieldIcon className="w-8 h-8 text-blue-600 dark:text-spotify-green" />
                    <div className="ml-3">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">RegScope</h1>
                        <p className="text-xs text-gray-500 dark:text-spotify-gray -mt-1">powered by Graviq.ai</p>
                    </div>
                </div>
                {isMobile && onClose && (
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        )}
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map(item => (
            item.roles.includes(currentUser.role) && (
              <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                isCollapsed={isCollapsed && !isMobile}
                isActive={currentView === item.view}
                onClick={() => {
                  onNavigate(item.view);
                  if (isMobile && onClose) onClose();
                }}
              />
            )
          ))}
        </ul>
      </nav>
       {!isMobile && (
        <div className="p-3 mt-auto border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center h-12 rounded-lg transition-colors duration-200 text-gray-600 dark:text-spotify-gray hover:bg-gray-100 dark:hover:bg-spotify-card"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className={`flex-shrink-0 w-12 flex items-center justify-center`}>
              {isCollapsed ? <ExpandRightIcon className="w-6 h-6" /> : <CollapseLeftIcon className="w-6 h-6" />}
            </span>
            {!isCollapsed && <span className="font-semibold">Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
