import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const salespeople = await prisma.salesperson.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { clients: true }
                }
            }
        });
        return NextResponse.json(salespeople);
    } catch (error) {
        console.error('Error fetching salespeople:', error);
        return NextResponse.json({ error: 'Error fetching salespeople' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone } = body;

        const salesperson = await prisma.salesperson.create({
            data: {
                name,
                phone,
            },
        });

        return NextResponse.json(salesperson);
    } catch (error) {
        console.error('Error creating salesperson:', error);
        return NextResponse.json({ error: 'Error creating salesperson' }, { status: 500 });
    }
}
