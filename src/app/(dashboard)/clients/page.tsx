'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/utils/format';
import { Search, Building2, User, Link as LinkIcon, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { parseISO, isAfter } from 'date-fns';
import { AddContractModal } from '@/components/AddContractModal';
import type { Client, Contract, Transaction } from '@/types';

import { EditClientModal } from '@/components/EditClientModal';
import { EditContractModal } from '@/components/EditContractModal';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [renewingClientId, setRenewingClientId] = useState<string | null>(null);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsRes, contractsRes, transactionsRes] = await Promise.all([
                fetch('/api/clients'),
                fetch('/api/contracts'),
                fetch('/api/transactions')
            ]);

            if (clientsRes.ok) setClients(await clientsRes.json());
            if (contractsRes.ok) setContracts(await contractsRes.json());
            if (transactionsRes.ok) setTransactions(await transactionsRes.json());
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClient = async (clientId: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente? Todos os contratos e histórico serão perdidos permanentemente.')) return;

        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchData();
            } else {
                alert('Erro ao excluir cliente.');
            }
        } catch (error) {
            console.error('Failed to delete client', error);
            alert('Erro ao excluir cliente.');
        }
    };

    const clientsWithStats = useMemo(() => {
        return clients.map(client => {
            const clientContracts = contracts.filter(c => c.clientId === client.id);
            const activeContracts = clientContracts.filter(c => c.active).length;
            const totalContracts = clientContracts.length;

            // Find latest contract end date
            let latestContract = null;
            if (clientContracts.length > 0) {
                latestContract = clientContracts.reduce((latest, current) => {
                    return isAfter(parseISO(current.endDate), parseISO(latest.endDate)) ? current : latest;
                });
            }

            // Calculate LTV (Total value of all contracts)
            const ltv = clientContracts.reduce((acc, c) => acc + c.totalValue, 0);

            // Calculate actual revenue (Paid transactions)
            const revenue = transactions
                .filter(t => t.clientId === client.id && t.status === 'paid')
                .reduce((acc, t) => acc + t.amount, 0);

            return {
                ...client,
                activeContracts,
                totalContracts,
                ltv,
                revenue,
                latestContract
            };
        });
    }, [clients, contracts, transactions]);

    const filteredClients = useMemo(() => {
        return clientsWithStats.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clientsWithStats, searchTerm]);

    const getSourceLabel = (source: string) => {
        const map: Record<string, string> = {
            'google': 'Google Ads',
            'meta': 'Meta Ads',
            'prospecting': 'Prospecção',
            'referral': 'Indicação'
        };
        return map[source] || source;
    };

    if (loading) {
        return <div className="p-8 text-center text-textMuted animate-pulse">Carregando clientes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text">Clientes</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredClients.map((client) => (
                    <div key={client.id} className="bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Identity */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-text">{client.name}</h3>
                                        {client.totalContracts > 1 && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                                {client.totalContracts} contratos
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-textMuted">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {client.closer === 'commercial' ? 'Comercial' : client.closer === 'agency' ? 'Agência' : 'Parceiro'}
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">{getSourceLabel(client.source)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Stats & Contract */}
                            <div className="flex items-center gap-6 md:border-l md:border-border md:pl-6">
                                {/* Contract Info */}
                                <div className="flex flex-col items-end min-w-[140px]">
                                    <span className="text-xs text-textMuted mb-0.5">Vencimento</span>
                                    {client.latestContract ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-text">
                                                {formatDate(client.latestContract.endDate)}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {client.latestContract.contractUrl && (
                                                    <a
                                                        href={client.latestContract.contractUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-textMuted hover:text-primary p-0.5"
                                                        title="Ver Contrato"
                                                    >
                                                        <LinkIcon className="w-3 h-3" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setEditingContract(client.latestContract)}
                                                    className="text-textMuted hover:text-primary p-0.5"
                                                    title="Editar Valor/Contrato"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-textMuted">-</span>
                                    )}
                                </div>

                                {/* LTV */}
                                <div className="flex flex-col items-end min-w-[100px]">
                                    <span className="text-xs text-textMuted mb-0.5">LTV</span>
                                    <span className="text-sm font-bold text-green-500">
                                        {formatCurrency(client.ltv)}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 md:pl-4 md:border-l md:border-border">
                                <button
                                    onClick={() => setEditingClient(client)}
                                    className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    title="Editar Cliente"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setRenewingClientId(client.id)}
                                    className="p-2 text-textMuted hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                    title="Novo Contrato"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Excluir Cliente"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div className="text-center py-12 text-textMuted bg-surface/50 border border-border/50 rounded-xl border-dashed">
                        Nenhum cliente encontrado.
                    </div>
                )}
            </div>

            <EditClientModal
                isOpen={!!editingClient}
                onClose={() => setEditingClient(null)}
                client={editingClient}
                onSuccess={() => {
                    fetchData();
                }}
            />

            <AddContractModal
                isOpen={!!renewingClientId}
                onClose={() => setRenewingClientId(null)}
                initialClientId={renewingClientId}
                onSuccess={() => {
                    fetchData();
                }}
            />

            <EditContractModal
                isOpen={!!editingContract}
                onClose={() => setEditingContract(null)}
                contract={editingContract}
                onSuccess={() => {
                    fetchData();
                }}
            />
        </div>
    );
}
