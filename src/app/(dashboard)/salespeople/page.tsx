'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, User, Phone, DollarSign, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import type { Client, Transaction, Salesperson } from '@/types';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SalespeoplePage() {
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedSalespersonId, setExpandedSalespersonId] = useState<string | null>(null);

    // Month Filter
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    // New Salesperson Form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salespeopleRes, clientsRes, transactionsRes] = await Promise.all([
                fetch('/api/salespeople'),
                fetch('/api/clients'),
                fetch('/api/transactions')
            ]);

            if (salespeopleRes.ok) setSalespeople(await salespeopleRes.json());
            if (clientsRes.ok) setClients(await clientsRes.json());
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

    const handleCreateSalesperson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/salespeople', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, phone: newPhone }),
            });

            if (res.ok) {
                setNewName('');
                setNewPhone('');
                setIsModalOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to create salesperson', error);
        }
    };

    const salespeopleStats = useMemo(() => {
        const [year, month] = selectedMonth.split('-');
        const filterDate = new Date(parseInt(year), parseInt(month) - 1);

        return salespeople.map(sp => {
            // Get clients for this salesperson
            const spClients = clients.filter(c => c.salespersonId === sp.id);

            // Calculate commissions
            const clientCommissions = spClients.map(client => {
                // Get paid transactions for this client in selected month
                const clientTransactions = transactions.filter(t =>
                    t.clientId === client.id &&
                    t.status === 'paid' &&
                    isSameMonth(parseISO(t.dueDate), filterDate)
                );

                const totalRevenue = clientTransactions.reduce((acc, t) => acc + t.amount, 0);
                const commissionAmount = totalRevenue * ((client.commissionRate || 0) / 100);

                return {
                    clientName: client.name,
                    commissionRate: client.commissionRate || 0,
                    revenue: totalRevenue,
                    commission: commissionAmount
                };
            });

            const totalCommission = clientCommissions.reduce((acc, c) => acc + c.commission, 0);

            return {
                ...sp,
                clientsCount: spClients.length,
                clientCommissions,
                totalCommission
            };
        });
    }, [salespeople, clients, transactions, selectedMonth]);

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vendedores</h2>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Novo Vendedor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {salespeopleStats.map((sp) => (
                    <div key={sp.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedSalespersonId(expandedSalespersonId === sp.id ? null : sp.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{sp.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {sp.phone || 'Sem telefone'}
                                        </span>
                                        <span>•</span>
                                        <span>{sp.clientsCount} clientes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Comissão ({format(parseISO(selectedMonth + '-01'), 'MMMM/yyyy', { locale: ptBR })})
                                    </p>
                                    <p className="text-lg font-bold text-green-500">{formatCurrency(sp.totalCommission)}</p>
                                </div>
                                {expandedSalespersonId === sp.id ? <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                            </div>
                        </div>

                        {expandedSalespersonId === sp.id && (
                            <div className="border-t border-border bg-black/5 dark:bg-black/20 p-4">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Detalhamento de Comissões</h4>
                                {sp.clientCommissions.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-gray-500 dark:text-gray-400 font-medium border-b border-border">
                                            <tr>
                                                <th className="pb-2">Cliente</th>
                                                <th className="pb-2">Receita (Mês)</th>
                                                <th className="pb-2">Taxa (%)</th>
                                                <th className="pb-2 text-right">Comissão</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {sp.clientCommissions.map((c, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-2 text-gray-900 dark:text-gray-100">{c.clientName}</td>
                                                    <td className="py-2 text-gray-500 dark:text-gray-400">{formatCurrency(c.revenue)}</td>
                                                    <td className="py-2 text-gray-500 dark:text-gray-400">{c.commissionRate}%</td>
                                                    <td className="py-2 text-right font-medium text-green-500">{formatCurrency(c.commission)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma comissão gerada neste mês.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {salespeopleStats.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        Nenhum vendedor cadastrado.
                    </div>
                )}
            </div>

            {/* Modal Novo Vendedor */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface border border-border w-full max-w-md rounded-xl shadow-2xl p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Novo Vendedor</h2>
                        <form onSubmit={handleCreateSalesperson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Telefone</label>
                                <input
                                    type="text"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
