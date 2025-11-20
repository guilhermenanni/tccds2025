# DraftMe - API + App Mobile (Expo / React Native + MySQL)

## Estrutura

- `backend/` - API em **Node.js + Express + MySQL**
- `mobile/`  - App em **Expo + React Native (TypeScript)**

---

## 1. Backend (API - Node / Express / MySQL)

### 1.1. Dependências

No diretório `backend/`:

```bash
npm install
```

### 1.2. Banco de dados MySQL

1. Crie um banco no MySQL (ou use o nome padrão `db_draftme`).
2. Importe o arquivo SQL:

```bash
mysql -u root -p < sql/schema.sql
```

Ou:

```bash
mysql -u root -p db_draftme < sql/schema.sql
```

### 1.3. Configurar `.env`

Crie um arquivo `.env` dentro de `backend/` baseado no `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=db_draftme
JWT_SECRET=uma_chave_secreta_bem_forte
```

### 1.4. Rodar a API

```bash
npm run dev
```

A API sobe em `http://localhost:3000`.

Rotas principais (resumo):

- `POST /auth/login/usuario`
- `POST /auth/login/time`
- `POST /auth/register/usuario`
- `POST /auth/register/time`
- `GET /postagens`
- `POST /postagens` (auth)
- `POST /postagens/:id/curtir` (auth)
- `DELETE /postagens/:id/curtir` (auth)
- `GET /comentarios/postagem/:id_postagem`
- `POST /comentarios` (auth)
- `GET /seletivas`
- `POST /seletivas` (apenas time autenticado)
- `POST /seletivas/:id/inscrever` (apenas jogador autenticado)
- `GET /usuarios/usuario/:id`
- `PUT /usuarios/usuario/:id` (auth)
- `GET /usuarios/time/:id`
- `PUT /usuarios/time/:id` (auth)
- etc.

---

## 2. Mobile (Expo + React Native)

### 2.1. Dependências

No diretório `mobile/`:

```bash
npm install
```

### 2.2. Configurar URL da API

No `mobile/src/api/client.ts`:

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
```

- Em **Android emulador**, `10.0.2.2` aponta para o `localhost` da máquina.
- Se for testar no celular físico, troque para o IP da sua máquina na mesma rede, por exemplo:

```ts
const API_URL = 'http://192.168.0.10:3000';
```

Outra opção é criar um arquivo `app.config.js` ou usar variáveis `EXPO_PUBLIC_API_URL`.

### 2.3. Rodar o app

Ainda dentro de `mobile/`:

```bash
npm run start
# ou
npm run android
# ou
npm run ios
```

---
