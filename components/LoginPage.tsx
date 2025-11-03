import React, { useState } from 'react';
import { USERS } from '../constants';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const ShieldIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V6.3l7-3.11v10.8z" />
    </svg>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>(USERS[0].email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.email === selectedUserEmail);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-spotify-dark">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-spotify-card rounded-lg shadow-2xl">
        <div className="flex flex-col items-center">
          <ShieldIcon className="w-16 h-16 text-blue-600 dark:text-spotify-green" />
          <h1 className="mt-4 text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100">
            RegScope
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-spotify-gray">
            Global Ingredient Compliance Dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user-select" className="sr-only">Select User</label>
              <select
                id="user-select"
                value={selectedUserEmail}
                onChange={(e) => setSelectedUserEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-spotify-green focus:border-spotify-green focus:z-10 sm:text-sm"
              >
                <option value="" disabled>Select a user to sign in</option>
                {USERS.map(user => (
                  <option key={user.email} value={user.email}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-spotify-green focus:border-spotify-green focus:z-10 sm:text-sm"
                placeholder="Password (mock)"
                defaultValue="**********"
              />
            </div>
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-spotify-green dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spotify-green transition-colors duration-200"
          >
            Sign in
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 dark:text-spotify-gray">
            Powered by Graviq.ai
        </p>
      </div>
    </div>
  );
};

export default LoginPage;