const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

async function main() {
    console.log('\n=================================================');
    console.log('   Agency CRM - Instalação Express (XAMPP)');
    console.log('=================================================\n');
    console.log('Tentando conectar com configurações padrão do XAMPP...');
    console.log('Host: localhost | User: root | Senha: (vazia)\n');

    const config = {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'agency_crm'
    };

    try {
        // 1. Conectar e criar banco
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
        console.log(`✅ Banco de dados '${config.database}' verificado/criado!`);
        await connection.end();

        // 2. Criar .env
        const dbUrl = `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
        const envContent = `DATABASE_URL="${dbUrl}"`;
        fs.writeFileSync(path.join(__dirname, '.env'), envContent);
        console.log('✅ Arquivo .env gerado!');

        // 3. Migrations
        console.log('\nCriando tabelas...');
        execSync('npx prisma db push', { stdio: 'inherit' });

        // 4. Build
        console.log('\nCompilando projeto...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log('\n=================================================');
        console.log('   INSTALAÇÃO CONCLUÍDA! 🚀');
        console.log('=================================================\n');
        console.log('Agora basta rodar o arquivo "iniciar.bat"');

    } catch (error) {
        console.error('\n❌ ERRO: Não foi possível conectar ao XAMPP.');
        console.error('Certifique-se de que o XAMPP está instalado e o botão "MySQL" está verde (Start).');
        console.error('Erro detalhado:', error.message);
    }
}

main();
