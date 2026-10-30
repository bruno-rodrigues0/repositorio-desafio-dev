# Folhagem & Cia — API

API da loja **Folhagem & Cia** com um **CRUD de plantas** para o treinamento de back-end dos aspirantes.

**Stack:** Node.js · Express · TypeScript · Prisma · PostgreSQL · Docker

> **CRUD** = **C**reate, **R**ead, **U**pdate e **D**elete: as quatro operações básicas de qualquer cadastro (criar, listar/buscar, editar e remover).

| Arquivo | O que tem |
|---|---|
| `README.md` (este) | Como rodar o projeto |
| [`DESAFIO.md`](DESAFIO.md) | O enunciado do desafio Folhagem & Cia: o que construir e entregar |

---

## ✅ Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/): roda a API e o banco em containers. **Deixe ele aberto** sempre que for rodar o projeto.
- [Node.js 20+](https://nodejs.org): para rodar os comandos `yarn` na sua máquina.
- Yarn: `npm install -g yarn`
- Um cliente HTTP para testar as rotas: [Thunder Client](https://www.thunderclient.com/) (extensão do VS Code), Insomnia ou Postman.

---

## ⚙️ Como rodar

Com o Docker Desktop aberto, rode na raiz do projeto:

```bash
# 1. Crie o .env a partir do modelo
cp .env.example .env        # no PowerShell ou CMD: copy .env.example .env

# 2. Instale as dependências na sua máquina
#    (sem isso, o yarn migration dá "cross-env não é reconhecido")
yarn

# 3. Suba a API e o banco
docker compose up -d --build

# 4. Crie as tabelas no banco a partir das migrations
yarn migration

# 5. (Opcional) Popule o banco de dados com plantas de teste.
yarn seed
```

### O `.env`

O `.env` guarda as configurações do projeto e **não vai para o git**. Os valores do `.env.example` já funcionam na sua máquina, então não precisa trocar nada. As únicas variáveis que você pode querer mexer:

| Variável | Quando mexer |
|---|---|
| `SERVER_PORT` | A porta 3001 já está em uso |
| `DATABASE_PORT` | A porta 5432 já está em uso (por exemplo, por um Postgres instalado na máquina) |

> **Por que o host do banco é `treinamento-crud-db` e não `localhost`?** A API roda *dentro* do Docker e enxerga o banco pelo nome do container. Os comandos que rodam na sua máquina (`yarn migration`, `yarn seed` e `yarn studio`) trocam o host para `localhost` sozinhos.

### Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `docker compose up -d` | Sobe a API e o banco |
| `docker compose logs -f server` | Mostra os logs da API (é aqui que os erros aparecem) |
| `docker compose down` | Derruba os containers (os dados do banco continuam salvos) |
| `yarn migration` | Cria uma migration a partir do `schema.prisma` e aplica no banco |
| `yarn seed` | Popula o banco com as plantas de exemplo |
| `yarn studio` | Abre o Prisma Studio para ver o banco no navegador |
| `yarn typecheck` | Procura erros de tipo no TypeScript |

A API recarrega sozinha quando você salva um arquivo em `src/`. Só precisa rodar `docker compose up -d --build` de novo se mudar o `package.json` ou o `Dockerfile`.

> Prefere npm? Todos os comandos funcionam com `npm install` e `npm run <comando>`.

---

## 📁 Estrutura

```
prisma/
  schema.prisma          # Models (tabelas) do banco
  seeds.ts               # Plantas de exemplo usadas pelo yarn seed
  migrations/            # Histórico de mudanças no banco, gerado pelo yarn migration
src/
  server.ts              # Cria o app Express e sobe o servidor
  routes/                # Liga cada rota HTTP a uma função do controller
  database/index.ts      # Conexão com o banco (Prisma Client)
  controllers/           # Recebe a requisição, valida e responde
  repositories/          # Única camada que conversa com o banco
```

O caminho de uma requisição:

```
Requisição → routes/ → Controller → Repository → Banco
                              ↓
Resposta  ←───────────────────┘  (status HTTP + JSON)
```

---

## 🆘 Problemas comuns

| Erro | O que fazer |
|---|---|
| `'cross-env' não é reconhecido como um comando` | Faltou instalar as dependências na sua máquina: rode `yarn`. |
| `Environment variable not found: DATABASE_URL` | Falta o `.env` na raiz do projeto: `cp .env.example .env`. |
| `failed to connect to the docker API` | O Docker Desktop está fechado. Abra e espere ele ficar pronto. |
| `port is already allocated` | Troque `SERVER_PORT` ou `DATABASE_PORT` no `.env` e suba de novo. |
| `Can't reach database server` | Os containers não estão de pé: `docker compose up -d`. |
| `Property 'planta' does not exist on type 'PrismaClient'` | Rode `yarn migration` e, no VS Code, **Ctrl+Shift+P → Restart TS Server**. |
| A API não responde em `localhost:3001` | Veja o erro em `docker compose logs -f server`. |
| `500` ao criar ou editar depois de mudar o `schema.prisma` | O banco ainda está com as colunas antigas: rode `yarn migration`. |
| `SyntaxError: ... is not valid JSON` ou `req.body` chega `undefined` | O corpo não foi como JSON. Cole o JSON puro em **Body → JSON**. |

> Dica: rode `yarn typecheck` antes de testar. A API não mostra erros de tipo ao rodar, mas o `typecheck` mostra todos de uma vez.
