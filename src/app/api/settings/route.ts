import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    appName: 'Agency CRM',
                    primaryColor: '#3B82F6',
                    primaryForegroundColor: '#FFFFFF',
                    surfaceColor: '#1E293B',
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    adminUsername: 'admin',
                    adminPassword: '123',
                    lightSurfaceColor: '#FFFFFF',
                    lightBackgroundColor: '#F1F5F9',
                    lightBorderColor: '#E2E8F0',
                    darkSurfaceColor: '#1E293B',
                    darkBackgroundColor: '#0F172A',
                    darkBorderColor: '#334155',
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        console.log('Settings PATCH received:', body);

        const existing = await prisma.systemSettings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.systemSettings.update({
                where: { id: existing.id },
                data: body
            });
        } else {
            settings = await prisma.systemSettings.create({
                data: {
                    appName: body.appName || 'Agency CRM',
                    primaryColor: body.primaryColor || '#3B82F6',
                    primaryForegroundColor: body.primaryForegroundColor || '#FFFFFF',
                    surfaceColor: body.surfaceColor || '#1E293B',
                    backgroundColor: body.backgroundColor || '#0F172A',
                    borderColor: body.borderColor || '#334155',
                    logoUrl: body.logoUrl,
                    faviconUrl: body.faviconUrl
                }
            });
        }

        return NextResponse.json({ settings, receivedBody: body });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
