# Agency CRM

Um sistema de CRM completo para agências, desenvolvido com Next.js, Prisma, MySQL e Tailwind CSS.

## 🚀 Funcionalidades Principais

- **Gestão de Clientes:** Cadastro completo, status, origem do lead.
- **Gestão de Contratos:** Controle de datas, valores, renovação automática.
- **Financeiro:** Controle de transações, status de pagamento (Pago, Pendente, Atrasado).
- **Vendedores:** Gestão de comissões e atribuição de clientes.
- **Dashboard:** Visão geral de faturamento anual/mensal e métricas.
- **Configurações do Sistema:**
  - Personalização de Cores (Temas Claro e Escuro independentes).
  - Upload de Logo e Favicon.
  - Alteração de credenciais de acesso (Admin).

## 🛠️ Tecnologias

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS.
- **Backend:** Next.js API Routes.
- **Banco de Dados:** MySQL (via Prisma ORM).
- **Ícones:** Lucide React.

## 📦 Instalação Local

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` com a URL do seu banco de dados.
4. Execute as migrações:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🌐 Deploy

Consulte o arquivo [DEPLOYMENT.md](DEPLOYMENT.md) para instruções detalhadas de instalação em servidor Linux.

## 🎨 Personalização

Acesse `/settings` para personalizar a aparência e as credenciais de acesso do sistema.
