import React from 'react';

const SettingsPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Profile</h3>
                    <p className="text-gray-600 dark:text-spotify-gray">Profile settings are managed by your organization's administrator.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
                    <p className="text-gray-600 dark:text-spotify-gray">Notification preferences will be available in a future update.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Theme</h3>
                    <p className="text-gray-600 dark:text-spotify-gray">Use the sun/moon icon in the header to toggle between light and dark themes.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;