import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addMonths, format } from 'date-fns';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { startDate, durationMonths, value, contractUrl } = body;

        // Parse startDate string to Date object
        const start = new Date(startDate);

        // Calculate new endDate
        const end = addMonths(start, durationMonths);

        const updatedContract = await prisma.contract.update({
            where: { id },
            data: {
                startDate: start,
                endDate: end,
                durationMonths,
                value,
                contractUrl,
                // Recalculate total value
                totalValue: value * durationMonths
            },
        });

        return NextResponse.json(updatedContract);
    } catch (error) {
        console.error('Error updating contract:', error);
        return NextResponse.json(
            { error: 'Error updating contract' },
            { status: 500 }
        );
    }
}
