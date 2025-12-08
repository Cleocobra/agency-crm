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

        // 1. Transaction to Update Contract and Handle Financials
        await prisma.$transaction(async (tx) => {
            // Parse inputs
            const start = new Date(startDate);
            const end = addMonths(start, durationMonths);

            // Update Contract
            await tx.contract.update({
                where: { id },
                data: {
                    startDate: start,
                    endDate: end,
                    durationMonths,
                    value,
                    contractUrl,
                    totalValue: value * durationMonths
                },
            });

            // 2. Handle Transactions

            // Delete all PENDING (future) transactions for this contract
            // We preserve 'paid' or 'overdue' history if needed, but usually 'pending' are the projections
            // Let's safe delete only 'pending'.
            await tx.transaction.deleteMany({
                where: {
                    contractId: id,
                    status: 'pending'
                }
            });

            // Count how many 'paid' transactions likely exist (to skip them)
            // Or simpler: Generate all potential dates. If a Paid transaction exists for roughly that month, skip.
            // But 'paid' transactions might have arbitrary dates. 

            // Reliable Method:
            // Count Paid Installments
            const paidCount = await tx.transaction.count({
                where: {
                    contractId: id,
                    status: 'paid'
                }
            });

            // Number of new installments to create
            const remainingInstallments = Math.max(0, durationMonths - paidCount);

            if (remainingInstallments > 0) {
                // Get client ID for transactions
                const contract = await tx.contract.findUnique({ where: { id }, select: { clientId: true } });
                if (!contract) throw new Error("Contract not found");

                // Generate new transactions starting after the paid ones
                const newTransactions = [];
                for (let i = 0; i < remainingInstallments; i++) {
                    const monthOffset = paidCount + i;
                    const dueDate = addMonths(start, monthOffset); // StartDate + (Paid Months)

                    newTransactions.push({
                        contractId: id,
                        clientId: contract.clientId,
                        dueDate: dueDate,
                        amount: Number(value),
                        status: 'pending',
                        description: `Mensalidade ${monthOffset + 1}/${durationMonths}`
                    });
                }

                if (newTransactions.length > 0) {
                    await tx.transaction.createMany({
                        data: newTransactions
                    });
                }
            }
        });

        // Fetch final result to return
        const finalContract = await prisma.contract.findUnique({ where: { id } });
        return NextResponse.json(finalContract);

    } catch (error) {
        console.error('Error updating contract:', error);
        return NextResponse.json(
            { error: 'Error updating contract' },
            { status: 500 }
        );
    }
}
