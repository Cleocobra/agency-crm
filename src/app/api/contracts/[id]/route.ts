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

        // Calculate new endDate
        const newEndDate = format(addMonths(new Date(startDate), durationMonths), 'yyyy-MM-dd');

        const updatedContract = await prisma.contract.update({
            where: { id },
            data: {
                startDate,
                endDate: newEndDate,
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
