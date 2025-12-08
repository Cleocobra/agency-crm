'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Save, RefreshCw, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings, resetSettings } = useSettings();
    const [formData, setFormData] = useState(settings);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await updateSettings(formData);
        setSaving(false);
        window.location.reload();
    };

    const handleRestoreDefaults = async () => {
        if (!confirm('Tem certeza que deseja restaurar as configurações padrão? Isso removerá o logo e as cores personalizadas.')) return;

        setSaving(true);
        await resetSettings();
        setSaving(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'logo') setUploadingLogo(true);
        else setUploadingFavicon(true);

        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            });

            if (res.ok) {
                const { url } = await res.json();
                if (type === 'logo') {
                    setFormData(prev => ({ ...prev, logoUrl: url }));
                } else {
                    setFormData(prev => ({ ...prev, faviconUrl: url }));
                }
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            if (type === 'logo') setUploadingLogo(false);
            else setUploadingFavicon(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações do Sistema</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Branding Section */}
                <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-border pb-2">Identidade Visual</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nome da Plataforma</label>
                                <input
                                    type="text"
                                    value={formData.appName}
                                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Usuário de Acesso</label>
                                <input
                                    type="text"
                                    value={formData.adminUsername}
                                    onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Usuário para login no sistema.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Senha de Acesso</label>
                                <input
                                    type="text"
                                    value={formData.adminPassword}
                                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Senha para login no sistema.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Logo do Sistema</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 bg-black/5 dark:bg-white/5 border border-border rounded-lg flex items-center justify-center overflow-hidden relative group">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                        )}
                                        {uploadingLogo && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <RefreshCw className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                                            <Upload className="w-4 h-4" />
                                            Escolher Arquivo
                                            <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => handleFileUpload(e, 'logo')} />
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Recomendado: <strong>PNG Transparente</strong>.<br />
                                            Resolução ideal: <strong>200x200px</strong> ou horizontal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Favicon (Ícone da Aba)</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-black/5 dark:bg-white/5 border border-border rounded-lg flex items-center justify-center overflow-hidden relative">
                                        {formData.faviconUrl ? (
                                            <img src={formData.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        )}
                                        {uploadingFavicon && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                                            <Upload className="w-4 h-4" />
                                            Escolher Arquivo
                                            <input type="file" className="hidden" accept="image/png, image/ico" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Recomendado: <strong>PNG ou ICO</strong>.<br />
                                            Resolução ideal: <strong>32x32px</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Highlight Colors Section */}
                <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-border pb-2">Cores Destaques</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Cor Primária</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.primaryColor}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Destaques e botões.</p>
                        </div>

                        {/* Primary Foreground Color (Text on Button) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Texto do Botão Primário</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.primaryForegroundColor || '#FFFFFF'}
                                        onChange={(e) => setFormData({ ...formData, primaryForegroundColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.primaryForegroundColor || '#FFFFFF'}
                                    onChange={(e) => setFormData({ ...formData, primaryForegroundColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor do texto dentro do botão.</p>
                        </div>
                    </div>
                </div>

                {/* Light Mode Colors Section */}
                <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-border pb-2">Cores do Modo Claro</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Light Surface Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Blocos e Menu (Claro)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.lightSurfaceColor || '#FFFFFF'}
                                        onChange={(e) => setFormData({ ...formData, lightSurfaceColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.lightSurfaceColor || '#FFFFFF'}
                                    onChange={(e) => setFormData({ ...formData, lightSurfaceColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor dos cartões no modo claro.</p>
                        </div>

                        {/* Light Background Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Fundo Principal (Claro)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.lightBackgroundColor || '#F1F5F9'}
                                        onChange={(e) => setFormData({ ...formData, lightBackgroundColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.lightBackgroundColor || '#F1F5F9'}
                                    onChange={(e) => setFormData({ ...formData, lightBackgroundColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor de fundo no modo claro.</p>
                        </div>

                        {/* Light Border Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Bordas (Claro)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.lightBorderColor || '#E2E8F0'}
                                        onChange={(e) => setFormData({ ...formData, lightBorderColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.lightBorderColor || '#E2E8F0'}
                                    onChange={(e) => setFormData({ ...formData, lightBorderColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor das bordas no modo claro.</p>
                        </div>
                    </div>
                </div>

                {/* Dark Mode Colors Section */}
                <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-border pb-2">Cores do Modo Escuro</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Dark Surface Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Blocos e Menu (Escuro)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.darkSurfaceColor || '#1E293B'}
                                        onChange={(e) => setFormData({ ...formData, darkSurfaceColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.darkSurfaceColor || '#1E293B'}
                                    onChange={(e) => setFormData({ ...formData, darkSurfaceColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor dos cartões no modo escuro.</p>
                        </div>

                        {/* Dark Background Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Fundo Principal (Escuro)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.darkBackgroundColor || '#0F172A'}
                                        onChange={(e) => setFormData({ ...formData, darkBackgroundColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.darkBackgroundColor || '#0F172A'}
                                    onChange={(e) => setFormData({ ...formData, darkBackgroundColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor de fundo no modo escuro.</p>
                        </div>

                        {/* Dark Border Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Bordas (Escuro)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.darkBorderColor || '#334155'}
                                        onChange={(e) => setFormData({ ...formData, darkBorderColor: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.darkBorderColor || '#334155'}
                                    onChange={(e) => setFormData({ ...formData, darkBorderColor: e.target.value })}
                                    className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cor das bordas no modo escuro.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                    <button
                        type="button"
                        onClick={handleRestoreDefaults}
                        disabled={saving}
                        className="flex items-center gap-2 bg-surface border border-border hover:bg-red-500/10 hover:text-red-500 text-gray-500 dark:text-gray-400 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Restaurar Padrão
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-primaryForeground font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
}
