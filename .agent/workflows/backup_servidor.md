---
description: Como fazer backup do banco de dados MySQL no servidor
---

# Backup do Banco de Dados (MySQL)

Este guia explica como criar uma cópia de segurança (backup) do seu banco de dados no servidor.

## 1. Acesse o servidor

Conecte-se ao seu servidor via terminal (SSH).

## 2. Vá para a pasta do projeto

```bash
cd /var/www/agency-crm
```

## 3. Descubra as credenciais do Banco

Execute o comando abaixo para ver o conteúdo do arquivo `.env` e encontrar a linha `DATABASE_URL`:

```bash
cat .env
```

Você verá algo como:
`DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"`

Anote:
- **Usuário**: `usuario` (parte entre `://` e `:`)
- **Senha**: `senha` (parte entre `:` e `@`)
- **Nome do Banco**: `nome_do_banco` (parte final, após a `/`)

## 4. Execute o comando de Backup

Use o comando `mysqldump` para criar o arquivo de backup. Substitua `USUARIO` e `NOME_DO_BANCO` pelos valores que você anotou.

```bash
mysqldump -u USUARIO -p NOME_DO_BANCO > backup_agency_$(date +%F).sql
```

Ao rodar este comando, ele pedirá a **senha**. Digite a senha que você anotou (ela não aparecerá na tela enquanto você digita) e aperte Enter.

## 5. Verifique se o arquivo foi criado

```bash
ls -lh *.sql
```

Você deve ver um arquivo como `backup_agency_2025-12-09.sql`.

## 6. Baixe o backup para seu computador (Opcional)

Se você estiver no Windows, pode usar o programa **FileZilla** ou rodar este comando **no terminal do seu computador (não no servidor)**:

```bash
scp root@ip-do-seu-servidor:/var/www/agency-crm/backup_agency_DATA.sql ./Desktop/
```
(Substitua `root@ip-do-seu-servidor` pelo seu acesso real e `DATA` pela data do arquivo).

---
**Dica:** Para restaurar um backup no futuro, use:
`mysql -u USUARIO -p NOME_DO_BANCO < arquivo_backup.sql`
