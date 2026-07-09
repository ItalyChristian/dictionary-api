# 📖 Dictionary API

API REST para consulta de um dicionário de inglês, construída sobre a [Free Dictionary API](https://dictionaryapi.dev/). Além de buscar palavras, a aplicação guarda o **histórico** de consultas de cada usuário, permite **favoritar** palavras e faz **cache** dos resultados para responder mais rápido em buscas repetidas.

O projeto foi desenvolvido como um estudo aprofundado de arquitetura de back-end, aplicando **Arquitetura Hexagonal (Ports & Adapters)**, **DDD**, **CQRS** e **Event-Driven** de ponta a ponta.

---

## 🚀 Tecnologias

Este projeto foi construído utilizando:

- **Node.js**
- **TypeScript**
- **Fastify** — framework HTTP
- **PostgreSQL** — banco de dados relacional
- **Drizzle ORM** — ORM e migrations
- **Redis** — cache e rate limiting
- **RabbitMQ** — mensageria / eventos de domínio
- **JWT** — autenticação stateless
- **Argon2** — hashing de senhas
- **Pino** — logs estruturados
- **Prometheus (prom-client)** — métricas
- **Swagger (OpenAPI)** — documentação
- **Docker** — infraestrutura local

---

## ⚙️ Funcionalidades

- ✅ Cadastro e autenticação de usuários (JWT + Argon2)
- ✅ Busca de palavras com paginação por cursor
- ✅ Consulta de definição de uma palavra
- ✅ Cache dos resultados (headers `x-cache` e `x-response-time`)
- ✅ Favoritar e desfavoritar palavras
- ✅ Histórico de palavras consultadas
- ✅ Rotas autenticadas com Bearer Token
- ✅ Rate limiting por rota e IP
- ✅ Documentação interativa via Swagger

---

## 🧠 Conceitos aplicados

- Arquitetura Hexagonal (Ports & Adapters)
- Domain-Driven Design (entidades ricas, value objects, domain events)
- CQRS (Command Bus e Query Bus)
- Arquitetura orientada a eventos (RabbitMQ)
- Estratégia de cache (cache-aside com Redis)
- Injeção de dependências
- Tipagem com TypeScript
- Tratamento centralizado de erros
- Observabilidade (logs estruturados + métricas)

---

## 📦 Passo a Passo para Iniciar a Aplicação

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose

### 1. Instalar dependências
Na raiz do projeto:
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo e ajuste se necessário:
```bash
cp .env.example .env
```


### 3. Subir a infraestrutura (PostgreSQL, Redis e RabbitMQ)
```bash
docker compose up -d postgres redis rabbitmq
```

### 4. Executar as migrations
```bash
npm run db:migrate
```

### 5. (Opcional) Importar a lista de palavras
```bash
npm run import-words
```

### 6. Rodar o servidor
```bash
npm run dev
```
O servidor sobe em modo de desenvolvimento na porta **3333**.

### 7. Acessar a aplicação
- API: http://localhost:3333
- Documentação Swagger: http://localhost:3333/docs
- Health check: http://localhost:3333/health

### 🔍 Drizzle Studio (opcional)
Para inspecionar o banco visualmente:
```bash
npm run db:studio
```

---

## 🛣️ Endpoints principais

| Método | Rota | Descrição | Autenticada |
|--------|------|-----------|:-----------:|
| `POST` | `/auth/signup` | Registra um novo usuário e retorna o token | — |
| `POST` | `/auth/signin` | Autentica e retorna o token | — |
| `GET`  | `/entries/en` | Lista palavras (`search`, `limit`, `cursor`) | 🔒 |
| `GET`  | `/entries/en/:word` | Retorna a definição de uma palavra | 🔒 |
| `POST` | `/entries/en/:word/favorite` | Favorita uma palavra | 🔒 |
| `DELETE` | `/entries/en/:word/unfavorite` | Remove uma palavra dos favoritos | 🔒 |
| `GET`  | `/user/me` | Perfil do usuário autenticado | 🔒 |
| `GET`  | `/user/me/favorites` | Lista as palavras favoritas | 🔒 |
| `GET`  | `/user/me/history` | Lista o histórico de consultas | 🔒 |

> 🔒 As rotas autenticadas exigem o header `Authorization: Bearer <token>`.

---

## 📜 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (porta 3333) |
| `npm run db:generate` | Gera novas migrations a partir do schema |
| `npm run db:migrate` | Aplica as migrations no banco |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run import-words` | Importa a lista de palavras para o banco |

---

## 🗂️ Estrutura do projeto

```
src/
├── adapters/http/        # Camada HTTP (Fastify): controllers, routes, middlewares
├── core/
│   ├── domain/           # Entidades, value objects, eventos e repositórios (interfaces)
│   ├── application/      # Casos de uso: commands, queries e event handlers
│   └── ports/            # Contratos (cache, event-bus, api, logger)
├── infrastructure/       # Implementações: Postgres, Redis, RabbitMQ, Pino, API externa
└── shared/               # Tipos compartilhados
```
---
v1.1.0 desenvolvida em 12 horas e 35 minutos (entre os dias 05/07/2026 e 08/07/2026)