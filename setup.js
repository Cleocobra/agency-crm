const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('\n=================================================');
    console.log('   Agency CRM - Assistente de Instalação');
    console.log('=================================================\n');
    console.log('Este assistente irá configurar o banco de dados e preparar o sistema.\n');

    try {
        // 1. Coletar informações do Banco de Dados
        console.log('--- Configuração do Banco de Dados MySQL ---\n');

        const host = await question('Host do Banco (padrão: localhost): ') || 'localhost';
        const port = await question('Porta do Banco (padrão: 3306): ') || '3306';
        const user = await question('Usuário do Banco (padrão: root): ') || 'root';
        const password = await question('Senha do Banco: ');
        const database = await question('Nome do Banco de Dados (padrão: agency_crm): ') || 'agency_crm';

        console.log('\nVerificando conexão e criando banco de dados se necessário...');

        // 2. Tentar conexão e criar banco
        const connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        console.log(`✅ Banco de dados '${database}' verificado/criado com sucesso!`);
        await connection.end();

        // 3. Criar arquivo .env
        const dbUrl = `mysql://${user}:${password}@${host}:${port}/${database}`;
        const envContent = `DATABASE_URL="${dbUrl}"`;

        fs.writeFileSync(path.join(__dirname, '.env'), envContent);
        console.log('✅ Arquivo .env configurado com sucesso!');

        // 4. Rodar Migrations do Prisma
        console.log('\nCriando tabelas no banco de dados (isso pode levar alguns segundos)...');
        try {
            execSync('npx prisma db push', { stdio: 'inherit' });
            console.log('✅ Tabelas criadas com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao criar tabelas. Verifique se o Prisma está instalado corretamente.');
            process.exit(1);
        }

        // 5. Build do Projeto
        console.log('\nCompilando o projeto para produção...');
        try {
            execSync('npm run build', { stdio: 'inherit' });
            console.log('✅ Projeto compilado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao compilar o projeto.');
            process.exit(1);
        }

        console.log('\n=================================================');
        console.log('   INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🚀');
        console.log('=================================================\n');
        console.log('Para iniciar o sistema, execute o arquivo "iniciar.bat" ou rode:');
        console.log('npm start');

    } catch (error) {
        console.error('\n❌ Ocorreu um erro durante a instalação:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   -> Não foi possível conectar ao MySQL. Verifique se ele está rodando.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   -> Usuário ou senha do banco incorretos.');
        }
    } finally {
        rl.close();
        // Manter janela aberta se rodado via duplo clique
        console.log('\nPressione qualquer tecla para sair...');
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
    }
}

main();
