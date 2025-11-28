# Guia de Instalação (Deploy) - Agency CRM

Este guia descreve os passos para instalar o Agency CRM em um servidor Linux (Ubuntu 20.04 ou superior).

## 1. Pré-requisitos do Servidor

Acesse seu servidor via SSH e instale as dependências necessárias:

```bash
# Atualizar lista de pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (Versão 18 ou superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL Server
sudo apt install -y mysql-server

# Instalar Nginx (Servidor Web)
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git
```

## 2. Configurar o Banco de Dados (MySQL)

Acesse o MySQL e crie o banco de dados e usuário:

```bash
sudo mysql
```

Dentro do console do MySQL, execute:

```sql
-- Criar banco de dados
CREATE DATABASE agency_crm;

-- Criar usuário (substitua 'sua_senha_segura' por uma senha forte)
CREATE USER 'agency_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';

-- Dar permissões
GRANT ALL PRIVILEGES ON agency_crm.* TO 'agency_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Instalar a Aplicação

Clone o repositório ou faça upload dos arquivos para o servidor (ex: `/var/www/agency-crm`).

```bash
# Exemplo clonando (se estiver no GitHub)
cd /var/www
git clone https://seu-repositorio.git agency-crm
cd agency-crm

# OU se fizer upload manual, navegue até a pasta
cd /var/www/agency-crm
```

Instale as dependências do projeto:

```bash
npm install
```

## 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
nano .env
```

Edite o arquivo `.env` com as configurações de produção:

```env
# Conexão com o Banco de Dados
DATABASE_URL="mysql://agency_user:sua_senha_segura@localhost:3306/agency_crm"

# URL da aplicação (seu domínio)
NEXT_PUBLIC_APP_URL="https://crm.suaagencia.com.br"
```

## 5. Preparar o Banco de Dados

Execute as migrações para criar as tabelas:

```bash
npx prisma migrate deploy
```

## 6. Build da Aplicação

Compile o projeto para produção:

```bash
npm run build
```

## 7. Configurar Gerenciador de Processos (PM2)

O PM2 manterá sua aplicação rodando em segundo plano.

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar a aplicação
pm2 start npm --name "agency-crm" -- start

# Configurar para iniciar com o sistema
pm2 startup
# (Execute o comando que o pm2 startup exibir na tela)
pm2 save
```

## 8. Configurar Nginx (Reverse Proxy)

Configure o Nginx para redirecionar o tráfego da porta 80 para a porta 3000 do Next.js.

Crie um arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/agency-crm
```

Cole o seguinte conteúdo (altere `seu-dominio.com`):

```nginx
server {
    listen 80;
    server_name crm.suaagencia.com.br;

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

Ative o site e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/agency-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Configurar SSL (HTTPS)

Instale o Certbot para gerar certificados SSL gratuitos (Let's Encrypt):

```bash
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado e configurar Nginx automaticamente
sudo certbot --nginx -d crm.suaagencia.com.br
```

## ✅ Concluído!

Sua aplicação deve estar acessível em `https://crm.suaagencia.com.br`.

### Comandos Úteis

- **Ver logs:** `pm2 logs agency-crm`
- **Reiniciar app:** `pm2 restart agency-crm`
- **Parar app:** `pm2 stop agency-crm`
