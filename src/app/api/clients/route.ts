import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(clients);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await prisma.client.create({
            data: {
                name: body.name,
                source: body.source,
                closer: body.closer,
                email: body.email,
                phone: body.phone,
                salespersonId: body.salespersonId || null,
                commissionRate: body.commissionRate ? parseFloat(body.commissionRate) : null,
            },
        });
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
