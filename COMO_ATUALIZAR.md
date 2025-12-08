# Como Atualizar o Sistema (Digital Ocean)

Sempre que fizermos alterações no código, siga estes passos para aplicar no servidor:

## 1. No seu Computador (Local)
Envie as alterações para o GitHub:
```bash
git add .
git commit -m "Atualizacao do sistema"
git push
```

## 2. No Servidor (Digital Ocean)
Acesse o servidor (se já não estiver lá):
```bash
ssh root@167.71.157.166
```

Entre na pasta e baixe as novidades:
```bash
cd /var/www/agency-crm
git pull
```

## 3. Aplicar as Mudanças
Dependendo do que mudou, rode os comandos abaixo. Na dúvida, rode todos:

1. Atualizar bibliotecas (se houver novas):
```bash
npm install
```

2. Atualizar Banco de Dados (se mudou tabelas):
```bash
npx prisma db push
```

3. Construir a nova versão (Obrigatório):
```bash
npm run build
```

4. Reiniciar o site (Obrigatório):
```bash
pm2 restart agency-crm
```

---
**Resumo Rápido (Copie e cole no servidor):**
```bash
cd /var/www/agency-crm && git pull && npm install && npx prisma db push && npm run build && pm2 restart agency-crm
```
