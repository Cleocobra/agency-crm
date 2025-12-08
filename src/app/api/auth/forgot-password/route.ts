import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { masterCode, newPassword } = await request.json();

        // Código mestre definido aqui ou via ENV
        // Adicione MASTER_CODE="seu-codigo-secreto" no .env do Railway
        const VALID_MASTER_CODE = process.env.MASTER_CODE || "MASTER-AGENCY-2025";

        if (masterCode !== VALID_MASTER_CODE) {
            return NextResponse.json({ error: "Código de recuperação inválido." }, { status: 401 });
        }

        const settings = await prisma.systemSettings.findFirst();

        if (settings) {
            await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    adminPassword: newPassword
                }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Configurações não encontradas." }, { status: 404 });
    } catch (error) {
        console.error("Erro reset senha:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
