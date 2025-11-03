import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SearchPage from './components/SearchPage';
import ProductReportPage from './components/ProductReportPage';
import RegulatoryDocumentsPage from './components/RegulatoryDocumentsPage';
import SettingsPage from './components/SettingsPage';
import MainLayout from './components/MainLayout';
import ChatWidget from './components/ChatWidget';
import IngredientDashboardPage from './components/IngredientDashboardPage';
import ProductDashboardPage from './components/ProductDashboardPage';
import type { Country, User, AppView } from './types';

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return 'dark'; // Default to dark theme
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('ingredient_dashboard');
  const [reportParams, setReportParams] = useState<{productName: string, country: Country} | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('ingredient_dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setReportParams(null);
  };
  
  const handleNavigate = (view: AppView) => {
    // If the user is already in the product search flow (viewing a report)
    // and clicks "Search" again, reset to the search form.
    if (currentView === 'search' && view === 'search') {
      setReportParams(null);
    }
    setCurrentView(view);
  };
  
  const handleSearch = (productName: string, country: Country) => {
    setReportParams({ productName, country });
    // Ensure the view is set to product_search when a search is performed.
    setCurrentView('search');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'ingredient_dashboard':
        return <IngredientDashboardPage />;
      case 'product_dashboard':
        return <ProductDashboardPage />;
      case 'search':
        // If a search has been performed, show the report. Otherwise, show the search form.
        if (reportParams) {
          return <ProductReportPage {...reportParams} onSearch={handleSearch} />;
        }
        return <SearchPage onSearch={handleSearch} />;
      case 'regulatory_documents':
        if (currentUser?.role === 'admin') {
          return <RegulatoryDocumentsPage />;
        }
        return <p>Access Denied</p>;
      case 'settings':
        return <SettingsPage />;
      default:
        return <IngredientDashboardPage />;
    }
  };

  if (!currentUser) {
    return (
       <div className="h-screen w-screen overflow-auto bg-slate-100 dark:bg-spotify-dark text-gray-800 dark:text-gray-200 font-sans">
          <LoginPage onLogin={handleLogin} />
       </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-spotify-dark text-gray-800 dark:text-gray-200 font-sans">
      <MainLayout
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentView={currentView}
        onNavigate={handleNavigate}
      >
        {renderContent()}
      </MainLayout>
      <ChatWidget 
        theme={theme} 
        currentUser={currentUser}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
