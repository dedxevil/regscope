import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import type { User, AppView } from '../types';
import type { Theme } from '../App';

interface MainLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentUser, onLogout, theme, onToggleTheme, currentView, onNavigate }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainContentPadding = currentView === 'ingredient_dashboard' || currentView === 'product_dashboard' ? '' : 'p-4 sm:p-6 lg:p-8';

  return (
    <div className="h-screen flex">
      {/* Mobile Sidebar (Overlay) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div 
        className={`fixed top-0 left-0 h-full z-50 lg:hidden transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar
          isCollapsed={false}
          onToggleCollapse={() => {}}
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={onNavigate}
          isMobile={true}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={onNavigate}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className={`flex-1 overflow-y-auto ${mainContentPadding}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
