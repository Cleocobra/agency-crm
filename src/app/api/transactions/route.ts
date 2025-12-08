import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                client: {
                    include: {
                        salesperson: true
                    }
                },
                contract: {
                    select: {
                        isPrepaid: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Failed to fetch transactions', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation could go here

        const transaction = await prisma.transaction.create({
            data: {
                contractId: body.contractId,
                clientId: body.clientId,
                dueDate: new Date(body.dueDate),
                amount: parseFloat(body.amount),
                status: body.status || 'pending',
                description: body.description,
                paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Failed to create transaction', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
