# Guia de Instalação via GitHub (Digital Ocean)

Este guia descreve como instalar o Agency CRM em um servidor Ubuntu 22.04 limpo, baixando o código diretamente do GitHub.

## 1. Preparar o Servidor (Rodar como root ou sudo)

Acesse o servidor via SSH e execute os comandos abaixo para instalar Node.js, MySQL e Nginx:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar ferramentas básicas
sudo apt install -y git curl build-essential

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (Gerenciador de Processos)
sudo npm install -g pm2
```

## 2. Configurar Memória Swap (CRÍTICO para servidores de 1GB RAM)

Evita que a instalação falhe por falta de memória.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 3. Configurar Banco de Dados

Acesse o MySQL:
```bash
sudo mysql
```

Rode os comandos SQL (altere a senha!):
```sql
CREATE DATABASE agency_crm;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'SenhaSegura123!';
GRANT ALL PRIVILEGES ON agency_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4. Baixar o Projeto do GitHub

Gere uma chave SSH no servidor para acessar o GitHub (se o repo for privado):
```bash
ssh-keygen -t ed25519 -C "servidor"
cat ~/.ssh/id_ed25519.pub
```
*Copie a chave exibida e adicione no GitHub em Settings > Deploy Keys.*

Agora clone o projeto:
```bash
cd /var/www
sudo git clone git@github.com:SEU-USUARIO/agency-crm.git
cd agency-crm
```
*(Se for repositório público, use `git clone https://github.com/SEU-USUARIO/agency-crm.git` sem precisar de chave)*

## 5. Instalar e Configurar

```bash
# Dar permissão para o usuário atual (se não for root)
sudo chown -R $USER:$USER /var/www/agency-crm

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

Edite o `.env` com os dados do banco criado no passo 3:
```ini
DATABASE_URL="mysql://crm_user:SenhaSegura123!@localhost:3306/agency_crm"
NEXT_PUBLIC_APP_URL="http://SEU_IP_OU_DOMINIO"
```

## 6. Banco de Dados e Build

```bash
# Criar tabelas no banco
npx prisma migrate deploy

# Gerar versão de produção
npm run build
```

## 7. Colocar Online

```bash
# Iniciar com PM2
pm2 start npm --name "agency-crm" -- start

# Salvar para iniciar com o sistema
pm2 save
pm2 startup
```

## 8. Configurar Nginx (Para acessar pelo navegador)

Crie a configuração:
```bash
sudo nano /etc/nginx/sites-available/agency-crm
```

Cole o conteúdo (altere `server_name` para seu domínio ou IP):
```nginx
server {
    listen 80;
    server_name SEU_IP_OU_DOMINIO;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative e reinicie:
```bash
sudo ln -s /etc/nginx/sites-available/agency-crm /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

✅ **Pronto!** Acesse pelo IP ou Domínio.
