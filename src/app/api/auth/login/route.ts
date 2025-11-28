import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            // Fallback if settings not initialized
            if (username === 'admin' && password === '123') {
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (username === settings.adminUsername && password === settings.adminPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
