import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatMonth = (dateStr: string) => {
    if (!dateStr) return '-';
    return format(parseISO(dateStr), 'MMMM yyyy', { locale: ptBR });
};
