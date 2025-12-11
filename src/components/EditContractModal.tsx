import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Contract } from '@/types';

interface EditContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: Contract | null;
    onSuccess?: () => void;
}

export const EditContractModal: React.FC<EditContractModalProps> = ({ isOpen, onClose, contract, onSuccess }) => {
    const [startDate, setStartDate] = useState('');
    const [durationMonths, setDurationMonths] = useState(0);
    const [value, setValue] = useState('');
    const [contractUrl, setContractUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && contract) {
            // Populate fields
            try {
                // If contract data comes with full date string, take YYYY-MM-DD
                const initialDate = contract.startDate ? contract.startDate.substring(0, 10) : format(new Date(), 'yyyy-MM-dd');
                setStartDate(initialDate);
            } catch (e) {
                setStartDate(format(new Date(), 'yyyy-MM-dd'));
            }

            setDurationMonths(contract.durationMonths || 12);
            setValue(contract.value.toString());
            setContractUrl(contract.contractUrl || '');
            setError('');
        }
    }, [isOpen, contract]);

    if (!isOpen || !contract) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/contracts/${contract.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate,
                    durationMonths: Number(durationMonths),
                    value: Number(value),
                    contractUrl
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Falha ao atualizar contrato');
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao atualizar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border bg-background/50">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Editar Contrato
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Atualize os dados e vencimento</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-1 hover:bg-background rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Início</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duração (Meses)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={durationMonths}
                                onChange={(e) => setDurationMonths(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Mensal (R$)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all font-medium"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link do Contrato</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={contractUrl}
                                onChange={(e) => setContractUrl(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
