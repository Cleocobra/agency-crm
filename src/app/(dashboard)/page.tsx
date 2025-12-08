'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { formatCurrency, formatDate, formatMonth } from '@/utils/format';
import { ArrowUpCircle, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { isSameMonth, parseISO, isBefore, startOfDay, addMonths, format } from 'date-fns';

import { Transaction, Client } from '@/types';

// Helper to fix timezone issues when displaying pure dates
const fixDate = (date: string | Date) => {
    if (typeof date === 'string' && date.includes('T')) {
        return new Date(date);
    }
    if (typeof date === 'string') {
        // Append T12:00:00 to avoid timezone rollback to previous day
        return new Date(date + 'T12:00:00');
    }
    return new Date(date);
};

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = async () => {
        try {
            const res = await fetch('/api/transactions', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePreviousMonth = () => {
        setCurrentDate(prev => addMonths(prev, -1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1));
    };

    const markTransactionAsPaid = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'paid', paymentDate: new Date().toISOString() }),
            });
            if (res.ok) {
                // Update local state
                setTransactions(prev => prev.map(t =>
                    t.id === id ? { ...t, status: 'paid', paymentDate: new Date().toISOString() } : t
                ));
            }
        } catch (error) {
            console.error('Failed to update transaction', error);
        }
    };

    const stats = useMemo(() => {
        const currentMonthTransactions = transactions.filter(t =>
            isSameMonth(fixDate(t.dueDate as string), currentDate)
        );

        const total = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0);

        const paid = currentMonthTransactions
            .filter(t => t.status === 'paid')
            .reduce((acc, t) => acc + t.amount, 0);

        const pending = currentMonthTransactions
            .filter(t => t.status === 'pending')
            .reduce((acc, t) => acc + t.amount, 0);

        // Overdue ONLY within this month
        // Logic: Status is pending AND Due Date is before Today (Start of Day)
        const overdue = currentMonthTransactions
            .filter(t =>
                t.status === 'pending' &&
                isBefore(fixDate(t.dueDate as string), startOfDay(new Date()))
            )
            .reduce((acc, t) => acc + t.amount, 0);

        // Prepaid Receivables (Recebíveis Antecipados)
        // Sum of transactions in this month where contract is prepaid
        const prepaid = currentMonthTransactions
            .filter(t => (t as any).contract?.isPrepaid)
            .reduce((acc, t) => acc + t.amount, 0);

        return { total, paid, pending, overdue, prepaid };
    }, [transactions, currentDate]);

    const filteredTransactions = useMemo(() => {
        let txs = transactions.filter(t => isSameMonth(fixDate(t.dueDate as string), currentDate));

        // Sort by due date
        txs.sort((a, b) => fixDate(a.dueDate as string).getTime() - fixDate(b.dueDate as string).getTime());

        if (filter === 'all') return txs;
        if (filter === 'overdue') {
            const now = startOfDay(new Date());
            return txs.filter(t => t.status === 'pending' && isBefore(fixDate(t.dueDate as string), now));
        }
        return txs.filter(t => t.status === filter);
    }, [transactions, filter, currentDate]);

    if (loading) {
        return <div className="p-8 text-center text-textMuted animate-pulse">Carregando dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Month Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text">Dashboard Financeiro</h2>
                <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-lg border border-border">
                    <button onClick={handlePreviousMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-textMuted hover:text-text transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <input
                            type="month"
                            value={format(currentDate, 'yyyy-MM')}
                            onChange={(e) => {
                                if (e.target.value) {
                                    setCurrentDate(parseISO(e.target.value + '-01'));
                                }
                            }}
                            className="bg-transparent text-lg font-semibold text-center text-text border-none focus:outline-none cursor-pointer"
                        />
                    </div>

                    <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-textMuted hover:text-text transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Mensal"
                    value={stats.total}
                    icon={ArrowUpCircle}
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <StatCard
                    title="Recebido"
                    value={stats.paid}
                    icon={CheckCircle2}
                    color="text-green-400"
                    bg="bg-green-400/10"
                />
                <StatCard
                    title="Antecipado"
                    value={stats.prepaid}
                    icon={Wallet}
                    color="text-purple-400"
                    bg="bg-purple-400/10"
                />
                <StatCard
                    title="Pendente"
                    value={stats.pending}
                    icon={Clock}
                    color="text-yellow-400"
                    bg="bg-yellow-400/10"
                />
                <StatCard
                    title="Em Atraso (Mês)"
                    value={stats.overdue}
                    icon={AlertCircle}
                    color="text-red-400"
                    bg="bg-red-400/10"
                />
            </div>

            {/* Transactions List */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Lançamentos de {formatMonth(currentDate.toISOString())}</h2>
                    <div className="flex space-x-2">
                        {(['all', 'paid', 'pending', 'overdue'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                    filter === f
                                        ? 'bg-primary text-primaryForeground'
                                        : 'text-textMuted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                                )}
                            >
                                {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagos' : f === 'pending' ? 'Pendentes' : 'Atrasados'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background/50 text-textMuted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Vencimento</th>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">Descrição</th>
                                <th className="px-6 py-4 font-medium">Valor</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.map((t) => {
                                const isOverdue = t.status === 'pending' && isBefore(fixDate(t.dueDate as string), startOfDay(new Date()));
                                const clientName = (t as any).client?.name || 'Cliente Desconhecido';
                                const isPrepaid = (t as any).contract?.isPrepaid;

                                return (
                                    <tr key={t.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatDate(fixDate(t.dueDate as string).toISOString())}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{clientName}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={clsx(
                                                        "px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide",
                                                        (t as any).client?.closer === 'commercial' ? "bg-purple-500/10 text-purple-400" :
                                                            (t as any).client?.closer === 'agency' ? "bg-blue-500/10 text-blue-400" :
                                                                "bg-orange-500/10 text-orange-400"
                                                    )}>
                                                        {(t as any).client?.closer === 'commercial' ? 'Comercial' : (t as any).client?.closer === 'agency' ? 'Agência' : 'Parceiro'}
                                                    </span>
                                                    {(t as any).client?.closer === 'commercial' && (t as any).client?.salesperson?.name && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">• {(t as any).client.salesperson.name}</span>
                                                    )}
                                                    {isPrepaid && (
                                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">
                                                            Antecipado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {t.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(t.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={t.status} isOverdue={isOverdue} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {t.status === 'pending' && (
                                                <button
                                                    onClick={() => markTransactionAsPaid(t.id)}
                                                    className="text-xs font-medium bg-green-500/10 text-green-400 px-3 py-1.5 rounded hover:bg-green-500/20 transition-colors"
                                                >
                                                    Marcar Pago
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-textMuted">
                                        Nenhum lançamento encontrado para este mês.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-surface p-4 rounded-xl border border-border flex items-center space-x-3">
        <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs text-textMuted font-medium truncate">{title}</p>
            <p className="text-xl font-bold text-text truncate">{formatCurrency(value)}</p>
        </div>
    </div>
);

const StatusBadge = ({ status, isOverdue }: { status: string, isOverdue: boolean }) => {
    if (status === 'paid') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                Pago
            </span>
        );
    }
    if (isOverdue) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                Atrasado
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
            Pendente
        </span>
    );
};
