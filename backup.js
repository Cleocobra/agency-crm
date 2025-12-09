const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// 1. Ler o arquivo .env
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// 2. Extrair DATABASE_URL
const lines = envContent.split('\n');
let databaseUrl = '';

for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL')) {
        // Pega tudo depois do primeiro = e remove as aspas se existirem
        const parts = trimmed.split('=');
        parts.shift(); // Remove 'DATABASE_URL'
        let value = parts.join('=').trim();
        value = value.replace(/^["']|["']$/g, ''); // Remove aspas do inicio e fim
        databaseUrl = value;
        break;
    }
}

if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada no .env');
    process.exit(1);
}

// 3. Parsear a URL de conexão
// Formato esperado: mysql://USER:PASSWORD@HOST:PORT/DATABASE
// Usar regex para extrair partes
// Regex robusto para mysql://user:pass@host:port/dbname
const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = databaseUrl.match(regex);

if (!match) {
    console.error('❌ Não foi possível ler as credenciais da DATABASE_URL. Verifique o formato no .env (esperado: mysql://user:pass@host:port/db)');
    process.exit(1);
}

const [, user, password, host, port, database] = match;

// Limpa database de query params eventuais (ex: ?schema=public)
const dbName = database.split('?')[0];

console.log(`✅ Credenciais encontradas para o banco: ${dbName} (Usuário: ${user})`);

// 4. Gerar nome do arquivo
const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const backupFile = `backup_${dbName}_${date}.sql`;
const backupPath = path.join(__dirname, backupFile);

console.log(`⏳ Iniciando backup para: ${backupFile}...`);

// 5. Executar mysqldump
// mysqldump -u [user] -p[password] -h [host] -P [port] [database] > [file]
// Nota: -p[password] não pode ter espaço entre -p e a senha

const command = `mysqldump -u "${user}" -p"${password}" -h "${host}" -P "${port}" "${dbName}" > "${backupPath}"`;

// Por segurança, não mostramos a senha no log
// console.log(`Executando: ${command.replace(password, '****')}`);

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Erro ao fazer backup: ${error.message}`);
        return;
    }
    if (stderr) {
        // mysqldump as vezes joga warnings no stderr, não necessariamente erro fatal, mas bom avisar
        if (!stderr.includes('Using a password on the command line interface can be insecure')) {
            // console.warn(`Aviso: ${stderr}`);
        }
    }

    console.log(`\n🎉 Backup concluído com sucesso!`);
    console.log(`📁 Arquivo salvo em: ${backupPath}`);
    console.log(`\nPara baixar (se estiver no SSH): use FileZilla ou scp.`);
});
