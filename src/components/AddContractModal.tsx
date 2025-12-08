import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addMonths, format } from 'date-fns';

interface AddContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialClientId?: string | null;
    onSuccess?: () => void;
}

interface Salesperson {
    id: string;
    name: string;
}

export const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onClose, initialClientId, onSuccess }) => {
    const [clientName, setClientName] = useState('');
    const [source, setSource] = useState('prospecting');
    const [closer, setCloser] = useState('commercial');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [duration, setDuration] = useState(6);
    const [value, setValue] = useState('');
    const [isPrepaid, setIsPrepaid] = useState(false);
    const [contractUrl, setContractUrl] = useState('');
    const [loading, setLoading] = useState(false);

    // Salesperson fields
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
    const [selectedSalespersonId, setSelectedSalespersonId] = useState('');
    const [commissionRate, setCommissionRate] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Fetch salespeople
            fetch('/api/salespeople')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setSalespeople(data);
                })
                .catch(err => console.error(err));

            if (!initialClientId) {
                setClientName('');
                setSource('prospecting');
                setCloser('commercial');
                setSelectedSalespersonId('');
                setCommissionRate('');
            }
            // Reset common fields
            setValue('');
            setContractUrl('');
            setStartDate(format(new Date(), 'yyyy-MM-dd'));
            setDuration(6);
            setIsPrepaid(false);
        }
    }, [isOpen, initialClientId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let clientId = initialClientId;

            if (!clientId) {
                // Create Client
                const clientRes = await fetch('/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: clientName,
                        source,
                        closer,
                        salespersonId: closer === 'commercial' ? selectedSalespersonId : null,
                        commissionRate: closer === 'commercial' ? commissionRate : null,
                    }),
                });

                if (!clientRes.ok) throw new Error('Failed to create client');
                const clientData = await clientRes.json();
                clientId = clientData.id;
            }

            // Create Contract
            const contractRes = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    startDate,
                    durationMonths: duration,
                    value: Number(value),
                    isPrepaid,
                    contractUrl,
                }),
            });

            if (!contractRes.ok) throw new Error('Failed to create contract');

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {initialClientId ? 'Renovar / Novo Contrato' : 'Novo Cliente e Contrato'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Client Info - Only show if creating new client */}
                    {!initialClientId && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nome do Cliente</label>
                                <input
                                    type="text"
                                    required
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex: Empresa X"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
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
                        </>
                    )}

                    {/* Contract Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Início do Contrato</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Duração (Meses)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Valor Mensal (R$)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contrato</label>
                        <div className="space-y-3">
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-surface hover:bg-background transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, Imagens (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setContractUrl(file.name);
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-surface px-2 text-gray-500 dark:text-gray-400">Ou link externo</span>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={contractUrl}
                                onChange={(e) => setContractUrl(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Cole o link (Google Drive, Dropbox...)"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="prepaid"
                            checked={isPrepaid}
                            onChange={(e) => setIsPrepaid(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                        />
                        <label htmlFor="prepaid" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Pagamento Antecipado?
                        </label>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : (initialClientId ? 'Adicionar Contrato' : 'Criar Cliente e Contrato')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
