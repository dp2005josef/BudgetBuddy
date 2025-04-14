# ETL Manager - Aplicação Angular

Aplicação para gerenciamento e agendamento de clientes ETL para data warehouse, desenvolvida com Angular Material.

## Requisitos

- Node.js (versão 18+)
- Angular CLI (versão 15+)
- NPM (versão 8+)

## Configuração do Ambiente de Desenvolvimento

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd etl-manager
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configuração de ambiente

Crie um arquivo `client/src/environments/environment.ts` (se ainda não existir) com as configurações necessárias:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000' // URL da sua API
};
```

Para produção, configure o arquivo `client/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.exemplo.com' // URL da API em produção
};
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`.

## Estrutura do Projeto

- **/client**: Aplicação Angular
  - **/src/app/core**: Serviços, modelos e utilidades centrais
  - **/src/app/features**: Componentes organizados por funcionalidade
  - **/src/app/shared**: Componentes, pipes e diretivas compartilhadas

- **/server**: Servidor Express para desenvolvimento e API

## Funcionalidades Principais

- 🔐 Autenticação e autorização baseada em roles
- 📊 Dashboard com métricas e status dos clientes ETL
- 👥 Gerenciamento de clientes ETL
- 📅 Configuração de agendamentos de processamento
- 🖥 Gerenciamento de bases de dados conectadas
- 📝 Logs de auditoria e monitoramento de execuções
- 👤 Gerenciamento de usuários

## Desenvolvimento

Para executar apenas o frontend em modo isolado:

```bash
cd client
ng serve
```

Para executar o servidor backend separadamente:

```bash
cd server
tsx index.ts
```