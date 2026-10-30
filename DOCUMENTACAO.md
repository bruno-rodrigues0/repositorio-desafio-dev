# Documentação da API — Folhagem & Cia

## 1. Visão geral

API REST para substituir a planilha da loja **Folhagem & Cia**, permitindo cadastrar, consultar, editar e remover plantas, controlar estoque e registrar vendas sem deixar o estoque ficar negativo.

**Stack:**

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker / Docker Compose

**Organização do projeto:**

```
prisma/
  schema.prisma       # Model Planta e enum Luminosidade
  seeds.ts            # Seed com plantas de exemplo
  migrations/         # Histórico de migrations
src/
  server.ts           # Cria e sobe o servidor Express
  routes/             # Definição das rotas
  controllers/        # Validação das requisições e respostas HTTP
  repositories/       # Acesso ao banco via Prisma
  database/index.ts   # Instância do Prisma Client
  utils/index.ts      # Utilitários (conversão para booleano)
```

A URL base local é `http://localhost:3001`.

---

## 2. Como rodar

Pré-requisitos: Docker Desktop aberto, Node.js 20+ e Yarn.

```bash
# 1. Crie o .env a partir do modelo
cp .env.example .env

# 2. Instale as dependências
yarn

# 3. Suba a API e o banco
docker compose up -d --build

# 4. Crie/aplique as tabelas no banco
yarn migration

# 5. (Opcional) Popule o banco com plantas de exemplo
yarn seed
```

Para conferir se a API subiu, acesse `http://localhost:3001`. Qualquer rota não mapeada responde `404` com `{ "message": "Rota não encontrada" }`.

Comandos úteis:

| Comando | O que faz |
|---|---|
| `docker compose up -d` | Sobe os containers da API e do banco |
| `docker compose logs -f server` | Mostra os logs da API |
| `docker compose down` | Derruba os containers |
| `yarn migration` | Cria e aplica migrations a partir do `schema.prisma` |
| `yarn migration:deploy` | Aplica migrations existentes (produção) |
| `yarn seed` | Insere as plantas de exemplo |
| `yarn studio` | Abre o Prisma Studio |
| `yarn typecheck` | Verifica erros de TypeScript |
| `yarn build` | Compila o projeto para `dist/` |
| `yarn start` | Roda a versão compilada |

Variáveis do `.env`:

| Variável | Descrição |
|---|---|
| `PROJECT_NAME` | Nome do projeto/container |
| `SERVER_PORT` | Porta da API (padrão `3001`) |
| `DATABASE_TYPE` | Tipo do banco (`postgres`) |
| `DATABASE_HOST` | Host do banco (`${PROJECT_NAME}-db` no Docker) |
| `DATABASE_PORT` | Porta do PostgreSQL (padrão `5432`) |
| `DATABASE_USER` | Usuário do banco |
| `DATABASE_PASSWORD` | Senha do banco |
| `DATABASE_DB` | Nome do banco |
| `DATABASE_URL` | URL completa de conexão usada pelo Prisma |

Os comandos rodados na máquina host (`yarn migration`, `yarn seed`, `yarn studio`) trocam `DATABASE_HOST` para `localhost` automaticamente.

---

## 3. Modelo de dados

### Model `Planta`

| Campo | Tipo | Exemplo | Observação |
|---|---|---|---|
| `id` | `Int` | `1` | Chave primária, autoincremento |
| `nome` | `String` | `"Costela-de-adão"` | Nome popular |
| `especie` | `String` | `"Monstera deliciosa"` | Nome científico |
| `preco` | `Int` | `8990` | Preço em **centavos** (`8990` = R$ 89,90) |
| `estoque` | `Int` | `12` | Vasos disponíveis; pode ser zero |
| `luminosidade` | `Luminosidade` | `"MEIA_SOMBRA"` | Enum |
| `petFriendly` | `Boolean` | `true` | Segura para cães e gatos |
| `regaACadaDias` | `Int` | `3` | Intervalo de rega em dias |
| `createdAt` | `DateTime` | | Preenchido automaticamente na criação |
| `updatedAt` | `DateTime` | | Atualizado automaticamente a cada edição |

### Enum `Luminosidade`

| Valor | Significado |
|---|---|
| `SOMBRA` | Sombra |
| `MEIA_SOMBRA` | Meia-sombra |
| `SOL_PLENO` | Sol pleno |

---

## 4. Rotas

Todas as requisições com corpo devem enviar `Content-Type: application/json`.

### 4.1. Cadastrar planta

`POST /plantas`

Corpo da requisição:

```json
{
  "nome": "Costela-de-adão",
  "especie": "Monstera deliciosa",
  "preco": 8990,
  "estoque": 12,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 3
}
```

Resposta `201 Created`:

```json
{
  "id": 25,
  "nome": "Costela-de-adão",
  "especie": "Monstera deliciosa",
  "preco": 8990,
  "estoque": 12,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 3,
  "createdAt": "2026-10-30T16:05:33.976Z",
  "updatedAt": "2026-10-30T16:05:33.976Z"
}
```

Regras aplicadas:

- Todos os campos são obrigatórios.
- `preco` deve ser maior que zero.
- `estoque` não pode ser negativo.
- `regaACadaDias` deve ser pelo menos `1`.
- `luminosidade` deve ser `SOMBRA`, `MEIA_SOMBRA` ou `SOL_PLENO`.
- `petFriendly` deve ser booleano.

> Observação: atualmente o cadastro com `estoque: 0` é rejeitado como campo faltante (ver seção 6).

---

### 4.2. Listar plantas

`GET /plantas`

Filtros e paginação opcionais via query string:

| Parâmetro | Valores | Padrão | Descrição |
|---|---|---|---|
| `page` | inteiro | `1` | Página |
| `take` | inteiro | `10` | Itens por página |
| `luminosidade` | `SOMBRA`, `MEIA_SOMBRA`, `SOL_PLENO` | | Filtra por luminosidade |
| `petFriendly` | `true`, `false` | | Filtra por pet-friendly |
| `disponivel` | `true`, `false` | | `true` = estoque > 0; `false` = estoque <= 0 |
| `orderBy` | `nome`, `especie`, `preco` | `id` | Campo de ordenação ascendente |

Os filtros podem ser combinados.

Exemplo:

```
GET /plantas?luminosidade=SOMBRA&petFriendly=true&orderBy=preco&page=1&take=5
```

Resposta `200 OK`:

```json
[
  {
    "id": 17,
    "nome": "Maranta-tricolor",
    "especie": "Maranta leuconeura",
    "preco": 3800,
    "estoque": 14,
    "luminosidade": "SOMBRA",
    "petFriendly": true,
    "regaACadaDias": 3,
    "createdAt": "2026-10-29T13:43:11.453Z",
    "updatedAt": "2026-10-29T13:43:11.453Z"
  }
]
```

> A busca por nome (`?nome=costela`) prevista como bônus **não** está implementada.

---

### 4.3. Buscar planta por id

`GET /plantas/:id`

Resposta `200 OK`: objeto da planta, no mesmo formato da listagem.

`404 Not Found` quando o id não existe:

```json
{ "message": "Planta não encontrada." }
```

---

### 4.4. Editar planta

`PATCH /plantas/:id`

Envie apenas os campos que deseja alterar. Os campos enviados passam pelas mesmas regras do cadastro.

Exemplo:

```json
{
  "preco": 2500,
  "estoque": 2
}
```

Resposta `200 OK`: planta atualizada, no mesmo formato da listagem.

Erros de validação retornam `400` com mensagem específica (ver seção 5).

> Observação: atualmente um id inexistente retorna `500` em vez de `404` (ver seção 6).

---

### 4.5. Remover planta

`DELETE /plantas/:id`

- `204 No Content` quando a planta é removida (sem corpo).
- `404 Not Found` quando o id não existe.

---

### 4.6. Registrar venda

`POST /plantas/:id/venda`

Corpo da requisição:

```json
{ "quantidade": 2 }
```

Resposta `200 OK`: planta com o estoque já decrementado.

```json
{
  "id": 25,
  "nome": "Costela-de-adão",
  "especie": "Monstera deliciosa",
  "preco": 2500,
  "estoque": 0,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 2,
  "createdAt": "2026-10-30T16:05:33.976Z",
  "updatedAt": "2026-10-30T16:05:34.438Z"
}
```

Regras:

- `quantidade` deve ser um inteiro maior ou igual a `1`.
- Sem estoque suficiente, retorna `400` e **não altera** o estoque.
- Id inexistente retorna `404`.

A baixa de estoque é atômica: a condição `estoque >= quantidade` faz parte do próprio `UPDATE`, então duas vendas simultâneas não conseguem deixar o estoque negativo. Se duas requisições disputarem o último vaso, apenas uma vence e a outra recebe `400`.

---

### 4.7. Valor total do estoque

`GET /plantas/estoque/valor-total`

Soma `preco × estoque` de todas as plantas e também o total de vasos.

Resposta `200 OK`:

```json
{
  "valorTotalEmCentavos": 154300,
  "totalDeVasos": 37
}
```

- `valorTotalEmCentavos`: soma de `preco × estoque` (em centavos).
- `totalDeVasos`: soma de todos os `estoque`.

---

### 4.8. Listar plantas esgotadas (bônus)

`GET /plantas/esgotadas`

Lista as plantas com `estoque <= 0`, usando a mesma paginação e ordenação da listagem principal.

| Parâmetro | Valores | Padrão |
|---|---|---|
| `page` | inteiro | `1` |
| `take` | inteiro | `10` |
| `orderBy` | `nome`, `especie`, `preco` | `id` |

Exemplo:

```
GET /plantas/esgotadas?take=2
```

Resposta `200 OK`: array de plantas esgotadas.

---

## 5. Erros e status HTTP

| Status | Quando acontece |
|---|---|
| `200` | Consulta, edição ou venda concluída com sucesso |
| `201` | Planta cadastrada com sucesso |
| `204` | Planta removida com sucesso |
| `400` | Dados inválidos (cadastro, edição, filtros ou venda) |
| `404` | Id não encontrado (busca, remoção, venda e rota inexistente) |
| `500` | Erro inesperado no servidor |

Mensagens de `400` por rota:

**`POST /plantas`**

| Mensagem | Situação |
|---|---|
| `Preencha todos os campos.` | `nome`, `especie`, `preco`, `estoque`, `luminosidade` ou `regaACadaDias` ausente/zero (inclui `preco: 0` e `estoque: 0`) |
| `Informe um preço válido.` | `preco` negativo |
| `Informe um intervalo de regagem válido.` | `regaACadaDias` menor que `1` |
| `Informe um valor de estoque válido.` | `estoque` negativo |
| `Informe um valor de luminosidade válido.` | `luminosidade` fora do enum |
| `Informe um valor de pet-friendly válido.` | `petFriendly` não booleano |

**`GET /plantas`**

| Mensagem | Situação |
|---|---|
| `Informe um filtro de luminosidade válido.` | `luminosidade` fora do enum |
| `Informe um filtro de pet-friendly válido.` | `petFriendly` diferente de `true`/`false` |
| `Informe um filtro de disponibilidade válido.` | `disponivel` diferente de `true`/`false` |
| `Informe um campo de ordenação válido.` | `orderBy` fora de `nome`, `especie`, `preco` |

**`PATCH /plantas/:id`**

| Mensagem | Situação |
|---|---|
| `Informe um preço válido.` | `preco` negativo |
| `Informe um intervalo de regagem válido.` | `regaACadaDias` menor que `1` |
| `Informe um valor de estoque válido.` | `estoque` negativo |
| `Informe um valor de luminosidade válido.` | `luminosidade` fora do enum |
| `Informe um valor de pet-friendly válido.` | `petFriendly` não booleano |

**`POST /plantas/:id/venda`**

| Mensagem | Situação |
|---|---|
| `Deve comprar pelo menos uma unidade.` | `quantidade` não inteira ou menor que `1` |
| `Sem estoque suficiente.` | Estoque menor que a quantidade solicitada |

**`GET /plantas/esgotadas`**

| Mensagem | Situação |
|---|---|
| `Informe um campo de ordenação válido.` | `orderBy` fora de `nome`, `especie`, `preco` |

Mensagens de `404`:

- `Planta não encontrada.` — `GET`, `DELETE` e venda com id inexistente.
- `Rota não encontrada` — rota não mapeada.

Mensagens de `500` (erros inesperados):

- `Erro ao criar planta.`
- `Erro ao ler as plantas.`
- `Erro ao atualizar planta.`
- `Erro ao deletar planta.`
- `Erro ao vender a planta.`
- `Erro ao recuperar o valor total.`
- `Erro ao ler plantas.` (`GET /plantas/esgotadas`)

---

## 6. Decisões e bônus

### Bônus implementados

- **Ordenação** via `?orderBy=nome|especie|preco` (ascendente). O enunciado sugeria `?ordem=`, mas a API usa `orderBy`.
- **Plantas esgotadas** em `GET /plantas/esgotadas`.
- **Seed** com 15 plantas de exemplo em `prisma/seeds.ts`, executável com `yarn seed`. A seed é idempotente: ignora plantas cujo `nome` e `especie` já existem (comparação sem diferenciar maiúsculas), então rodar de novo não duplica registros.

### Decisões adicionais

- **Paginação** com `page` e `take` na listagem principal e na lista de esgotadas (padrão `1` e `10`).
- **Filtro `disponivel`** extra: `true` retorna estoque maior que zero e `false` retorna estoque menor ou igual a zero.
- **Concorrência na venda**: `updateMany` com `where: { id, estoque: { gte: quantidade } }` e `decrement`. A verificação e o decremento ocorrem na mesma instrução SQL; quando nenhuma linha é afetada, o controller verifica se a planta existe para responder `404` ou `400`. Teste com 20 vendas simultâneas de 1 unidade em uma planta com estoque 1: exatamente uma venda retornou `200`, dezenove retornaram `400` e o estoque final ficou em `0`.
- **Tratamento de erros** centralizado nos controllers; o repository apenas executa as operações do Prisma.

### Limitações conhecidas (divergências do enunciado)

- **Cadastro com `estoque: 0`**: a validação `!estoque` trata zero como campo ausente, retornando `400`. O enunciado permite estoque zero (planta esgotada). A edição (`PATCH`) aceita `estoque: 0` normalmente.
- **`PATCH /plantas/:id` com id inexistente**: retorna `500` em vez de `404`, porque a consulta `findById` não é aguardada (`await`) antes da verificação de existência.
- **Busca por nome** (`?nome=costela`) não foi implementada; o parâmetro é ignorado.
- **`?orderBy=id`** é rejeitado com `400`; `id` é apenas a ordenação padrão quando `orderBy` não é informado.
- **`GET /plantas/estoque/valor-total` com banco vazio**: `totalDeVasos` pode vir como `null`, pois o `_sum` do Prisma não retorna zero quando não há registros.
