import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Client } from '@/types';

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onSuccess: () => void;
}

interface Salesperson {
    id: string;
    name: string;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client, onSuccess }) => {
    const [name, setName] = useState('');
    const [source, setSource] = useState('prospecting');
    const [closer, setCloser] = useState('commercial');
    const [loading, setLoading] = useState(false);

    // Salesperson fields
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
    const [selectedSalespersonId, setSelectedSalespersonId] = useState('');
    const [commissionRate, setCommissionRate] = useState('');

    useEffect(() => {
        if (isOpen && client) {
            setName(client.name);
            setSource(client.source);
            setCloser(client.closer);
            setSelectedSalespersonId(client.salespersonId || '');
            setCommissionRate(client.commissionRate ? client.commissionRate.toString() : '');

            // Fetch salespeople
            fetch('/api/salespeople')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setSalespeople(data);
                })
                .catch(err => console.error(err));
        }
    }, [isOpen, client]);

    if (!isOpen || !client) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/clients/${client.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    source,
                    closer,
                    salespersonId: closer === 'commercial' ? selectedSalespersonId : null,
                    commissionRate: closer === 'commercial' ? commissionRate : null,
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                console.error('Failed to update client');
            }
        } catch (error) {
            console.error('Error updating client:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Editar Cliente</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nome do Cliente</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Origem do Lead</label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="prospecting">Prospecção</option>
                                <option value="meta">Meta Ads</option>
                                <option value="google">Google Ads</option>
                                <option value="referral">Indicação</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fechamento</label>
                            <select
                                value={closer}
                                onChange={(e) => setCloser(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="commercial">Comercial</option>
                                <option value="agency">Agência</option>
                                <option value="partner">Parceiro</option>
                            </select>
                        </div>
                    </div>

                    {closer === 'commercial' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vendedor</label>
                                <select
                                    value={selectedSalespersonId}
                                    onChange={(e) => setSelectedSalespersonId(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required={closer === 'commercial'}
                                >
                                    <option value="">Selecione...</option>
                                    {salespeople.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Comissão (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={commissionRate}
                                    onChange={(e) => setCommissionRate(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex: 10"
                                    required={closer === 'commercial'}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
