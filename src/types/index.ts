export type LeadSource = 'prospecting' | 'meta' | 'google' | 'referral' | 'other';
export type Closer = 'commercial' | 'agency' | 'partner';
export type TransactionStatus = 'paid' | 'pending' | 'overdue';

export interface Client {
    id: string;
    name: string;
    source: LeadSource;
    closer: Closer;
    email?: string;
    phone?: string;
    createdAt: string;
    salespersonId?: string | null;
    commissionRate?: number | null;
}

export interface Salesperson {
    id: string;
    name: string;
    phone?: string;
    createdAt: string;
}

export interface Contract {
    id: string;
    clientId: string;
    startDate: string; // ISO Date
    endDate: string; // ISO Date
    value: number; // Monthly value
    totalValue: number; // Total contract value
    isPrepaid: boolean;
    durationMonths: number;
    active: boolean;
    contractUrl?: string; // Link or file reference
}

export interface Transaction {
    id: string;
    contractId: string;
    clientId: string;
    dueDate: string; // ISO Date
    amount: number;
    status: TransactionStatus;
    paymentDate?: string; // ISO Date
    description: string; // e.g., "Mensalidade 1/6"
}

export interface DashboardStats {
    totalMonthly: number;
    paidMonthly: number;
    pendingMonthly: number;
    overdueMonthly: number;
}

export interface User {
    username: string;
    password?: string; // In a real app, this wouldn't be stored in plain text on the client
    isAuthenticated: boolean;
}
