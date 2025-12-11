import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, PlusCircle, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useSettings } from '@/context/SettingsContext';

interface LayoutProps {
    children: React.ReactNode;
    onOpenNewContract: () => void;
    onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenNewContract, onLogout }) => {
    const { settings, isDarkMode, toggleDarkMode } = useSettings();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { id: 'clients', label: 'Clientes', icon: Users, href: '/clients' },
        { id: 'salespeople', label: 'Vendedores', icon: Users, href: '/salespeople' },
        { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
    ] as const;

    const handleLogout = () => {
        document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        window.location.href = '/login';
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="flex h-screen bg-background text-gray-900 dark:text-gray-100 transition-colors duration-300">

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-40 flex items-center justify-between px-4">
                <div className="flex items-center">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="max-w-[120px] h-8 object-contain" />
                    ) : (
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate">
                            {settings.appName}
                        </h1>
                    )}
                </div>
                <button onClick={toggleMobileMenu} className="text-gray-500 dark:text-gray-400 p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside className={clsx(
                "fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 transform md:transform-none",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-6 hidden md:flex items-center justify-center">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="max-w-full h-12 object-contain" />
                    ) : (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate">
                            {settings.appName}
                        </h1>
                    )}
                </div>

                {/* Logo Area Mobile (inside drawer) */}
                <div className="p-6 md:hidden flex items-center justify-between">
                    <span className="font-bold text-lg">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    'flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                                )}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border space-y-4">
                    <button
                        onClick={() => { toggleDarkMode(); setIsMobileMenuOpen(false); }}
                        className="flex items-center w-full px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                        <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Sair</span>
                    </button>

                    <button
                        onClick={() => { onOpenNewContract(); setIsMobileMenuOpen(false); }}
                        className="flex items-center justify-center w-full px-4 py-3 bg-primary hover:bg-blue-600 text-primaryForeground rounded-lg transition-colors font-semibold shadow-lg shadow-blue-500/20"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Novo Contrato
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
