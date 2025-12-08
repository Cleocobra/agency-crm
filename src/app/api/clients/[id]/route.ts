import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, source, closer } = body;

        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name,
                source,
                closer,
                salespersonId: body.salespersonId || null,
                commissionRate: body.commissionRate ? parseFloat(body.commissionRate) : null,
            },
        });

        return NextResponse.json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { error: 'Error updating client' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Use transaction to delete related records first (Cascade Delete)
        await prisma.$transaction([
            // 1. Delete all transactions related to this client
            prisma.transaction.deleteMany({
                where: { clientId: id }
            }),
            // 2. Delete all contracts related to this client
            prisma.contract.deleteMany({
                where: { clientId: id }
            }),
            // 3. Finally, delete the client
            prisma.client.delete({
                where: { id },
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: 'Error deleting client' },
            { status: 500 }
        );
    }
}
