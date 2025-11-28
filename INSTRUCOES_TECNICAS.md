# Manual de Instalação - Agency CRM

**Para:** Responsável Técnico / DevOps
**Data:** 27/11/2025
**Projeto:** Agency CRM (Next.js + MySQL)

---

## Visão Geral

Este é um projeto **Next.js** (App Router) utilizando **Prisma ORM** com banco de dados **MySQL**. O projeto deve ser hospedado em um ambiente Node.js.

## Requisitos do Servidor

- **OS:** Linux (Ubuntu 20.04+ recomendado)
- **Node.js:** Versão 18.x ou superior (LTS)
- **Banco de Dados:** MySQL 8.0+
- **Gerenciador de Processos:** PM2 (recomendado)
- **Web Server:** Nginx (como Reverse Proxy)

---

## Passo a Passo de Instalação

### 1. Preparação dos Arquivos
Extraia o arquivo `.zip` fornecido no diretório de destino do servidor (ex: `/var/www/agency-crm`).

### 2. Instalação de Dependências
No diretório do projeto, execute:

```bash
npm install
```

### 3. Configuração de Ambiente
1. Renomeie o arquivo `.env.example` para `.env`.
2. Edite o arquivo `.env` com as credenciais de produção:

```ini
# Exemplo de .env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com.br"
```

### 4. Configuração do Banco de Dados
Execute as migrações do Prisma para criar as tabelas no banco de dados MySQL configurado:

```bash
npx prisma migrate deploy
```

### 5. Build da Aplicação
Gere a versão de produção:

```bash
npm run build
```

### 6. Execução (PM2)
Inicie a aplicação na porta 3000:

```bash
pm2 start npm --name "agency-crm" -- start
pm2 save
pm2 startup
```

### 7. Configuração do Nginx (Reverse Proxy)
Configure o Nginx para encaminhar a porta 80/443 para a porta 3000 local.

Exemplo de bloco `server`:

```nginx
server {
    server_name seu-dominio.com.br;

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

### 8. SSL (HTTPS)
Recomendamos usar o Certbot para gerar o certificado SSL:

```bash
sudo certbot --nginx -d seu-dominio.com.br
```

---

## Suporte / Dúvidas Comuns

- **Erro de Conexão com Banco:** Verifique se a string de conexão no `.env` está correta e se o usuário MySQL tem permissões.
- **Erro de Permissão:** Certifique-se de que o usuário que está rodando o Node tem permissão de leitura/escrita na pasta.
- **Login Inicial:**
  - Usuário: `admin`
  - Senha: `123`
  - *Alterar imediatamente após a instalação em `/settings`.*
