import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addMonths, parseISO } from 'date-fns';

export async function GET() {
    try {
        const contracts = await prisma.contract.findMany({
            include: { client: true },
            orderBy: { startDate: 'desc' },
        });
        return NextResponse.json(contracts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, startDate, durationMonths, value, isPrepaid, contractUrl } = body;

        const totalValue = value * durationMonths;
        const start = parseISO(startDate);

        // Transaction logic
        const transactionsData = [];
        for (let i = 0; i < durationMonths; i++) {
            const dueDate = addMonths(start, i);
            transactionsData.push({
                clientId,
                dueDate: dueDate,
                amount: value,
                status: 'pending',
                description: `Mensalidade ${i + 1}/${durationMonths}`,
            });
        }

        const contract = await prisma.contract.create({
            data: {
                clientId,
                startDate: start,
                endDate: addMonths(start, durationMonths),
                value,
                totalValue,
                isPrepaid: isPrepaid || false,
                durationMonths,
                active: true,
                contractUrl,
                transactions: {
                    create: transactionsData,
                },
            },
        });

        return NextResponse.json(contract);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }
}
