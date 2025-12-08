'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SystemSettings {
    appName: string;
    primaryColor: string;
    primaryForegroundColor: string;
    surfaceColor: string;
    backgroundColor: string;
    borderColor: string;

    adminUsername: string;
    adminPassword: string;

    // Light mode colors
    lightSurfaceColor: string;
    lightBackgroundColor: string;
    lightBorderColor: string;

    // Dark mode colors
    darkSurfaceColor: string;
    darkBackgroundColor: string;
    darkBorderColor: string;

    logoUrl?: string;
    faviconUrl?: string;
}

interface SettingsContextType {
    settings: SystemSettings;
    updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
    resetSettings: () => Promise<void>;
    loading: boolean;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const defaultSettings: SystemSettings = {
    appName: 'Agency CRM',
    primaryColor: '#3B82F6',
    primaryForegroundColor: '#FFFFFF',
    surfaceColor: '#1E293B',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    adminUsername: 'admin',
    adminPassword: '123',

    // Light mode defaults
    lightSurfaceColor: '#FFFFFF',
    lightBackgroundColor: '#F1F5F9',
    lightBorderColor: '#E2E8F0',

    // Dark mode defaults
    darkSurfaceColor: '#1E293B',
    darkBackgroundColor: '#0F172A',
    darkBorderColor: '#334155',
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    updateSettings: async () => { },
    resetSettings: async () => { },
    loading: false,
    isDarkMode: true,
    toggleDarkMode: () => { },
});

export const useSettings = () => useContext(SettingsContext);

const hexToRgb = (hex: string) => {
    if (!hex) return '241 245 249';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : '241 245 249';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                // Use the current isDarkMode state, or initialize it if it's the first load
                const savedDarkMode = localStorage.getItem('darkMode');
                const currentDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true;
                applyTheme(data, currentDarkMode);
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (data: SystemSettings, darkMode: boolean) => {
        if (data.primaryColor) {
            document.documentElement.style.setProperty('--color-primary', hexToRgb(data.primaryColor));
        }
        if (data.primaryForegroundColor) {
            document.documentElement.style.setProperty('--color-primary-foreground', hexToRgb(data.primaryForegroundColor));
        }

        // Determine which colors to use based on the mode
        const surface = darkMode ? data.darkSurfaceColor : data.lightSurfaceColor;
        const background = darkMode ? data.darkBackgroundColor : data.lightBackgroundColor;
        const border = darkMode ? data.darkBorderColor : data.lightBorderColor;

        // Fallback to generic colors if specific ones are missing (for backward compatibility)
        const finalSurface = surface || data.surfaceColor;
        const finalBackground = background || data.backgroundColor;
        const finalBorder = border || data.borderColor;

        if (finalSurface) document.documentElement.style.setProperty('--color-surface', hexToRgb(finalSurface));
        if (finalBackground) document.documentElement.style.setProperty('--color-background', hexToRgb(finalBackground));
        if (finalBorder) document.documentElement.style.setProperty('--color-border', hexToRgb(finalBorder));
    };

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Re-apply theme with new mode using existing settings
        applyTheme(settings, newDarkMode);
    };

    const updateSettings = async (newSettings: Partial<SystemSettings>) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.settings) {
                    setSettings(data.settings);
                    applyTheme(data.settings, isDarkMode);
                }
            } else {
                console.error('Failed to save settings');
                await fetchSettings();
            }
        } catch (error) {
            console.error('Error updating settings', error);
            await fetchSettings();
        }
    };

    const resetSettings = async () => {
        const defaults: SystemSettings = {
            appName: 'Agency CRM',
            primaryColor: '#3B82F6',
            primaryForegroundColor: '#FFFFFF',
            surfaceColor: '#1E293B',
            backgroundColor: '#0F172A',
            borderColor: '#334155',
            // Preserve current credentials
            adminUsername: settings.adminUsername,
            adminPassword: settings.adminPassword,
            lightSurfaceColor: '#FFFFFF',
            lightBackgroundColor: '#F1F5F9',
            lightBorderColor: '#E2E8F0',
            darkSurfaceColor: '#1E293B',
            darkBackgroundColor: '#0F172A',
            darkBorderColor: '#334155',
            logoUrl: '',
            faviconUrl: ''
        };

        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(defaults),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.settings) {
                    setSettings(data.settings);
                    setIsDarkMode(true);
                    document.documentElement.classList.add('dark');
                    applyTheme(data.settings, true);
                }
            } else {
                console.error('Failed to reset settings');
            }
        } catch (error) {
            console.error('Error resetting settings', error);
        }
    };

    useEffect(() => {
        // Initialize dark mode from localStorage or default to true
        const savedDarkMode = localStorage.getItem('darkMode');
        const initialDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true;
        setIsDarkMode(initialDarkMode);

        if (initialDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        fetchSettings();
    }, []);

    useEffect(() => {
        // Save dark mode preference
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, loading, isDarkMode, toggleDarkMode }}>
            {children}
        </SettingsContext.Provider>
    );
};
