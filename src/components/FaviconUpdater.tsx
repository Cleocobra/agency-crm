'use client';

import { useSettings } from '@/context/SettingsContext';
import { useEffect } from 'react';

export default function FaviconUpdater() {
    const { settings } = useSettings();

    useEffect(() => {
        if (settings.faviconUrl) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            (link as HTMLLinkElement).type = 'image/x-icon';
            (link as HTMLLinkElement).rel = 'shortcut icon';
            (link as HTMLLinkElement).href = settings.faviconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [settings.faviconUrl]);

    return null;
}
