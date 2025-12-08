import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.systemSettings.findFirst();

        if (settings) {
            await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    adminUsername: 'admin',
                    adminPassword: '123'
                }
            });
            return NextResponse.json({
                success: true,
                message: "SUCESSO! Suas credenciais foram restauradas para o padrão.",
                credentials: {
                    usuario: "admin",
                    senha: "123"
                }
            });
        }

        return NextResponse.json({ error: "Configurações não encontradas no banco." });
    } catch (error) {
        console.error("Erro no reset:", error);
        return NextResponse.json({ error: "Erro interno ao tentar resetar." }, { status: 500 });
    }
}
