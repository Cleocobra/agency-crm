'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [masterCode, setMasterCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterCode, newPassword }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess('Senha redefinida com sucesso! Redirecionando...');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setError(data.error || 'Código inválido.');
            }
        } catch (err) {
            setError('Erro ao tentar redefinir. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">Recuperar Acesso</h1>
                    <p className="text-textMuted text-sm">Use o Código Mestre para definir uma nova senha.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1">Código Mestre</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-5 h-5" />
                            <input
                                type="text"
                                value={masterCode}
                                onChange={(e) => setMasterCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                placeholder="Digite o código de segurança"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-5 h-5" />
                            <input
                                type="text" // Text type to see password, or password type
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                placeholder="Digite a nova senha"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-500 text-sm text-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20"
                    >
                        Redefinir Senha
                    </button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-sm text-textMuted hover:text-primary flex items-center justify-center gap-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Voltar para Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
