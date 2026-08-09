# Decorar

Marketplace de venda e revenda de mobília e objetos de decoração. MVP funcional
com autenticação, CRUD completo de anúncios, upload de imagens, busca com
filtros, perfil de usuário e página de loja.

---

## Rodando o projeto

```bash
npm install
```

```bash
npm run setup
```

`setup` gera o Prisma Client, cria o banco SQLite e popula com o catálogo de
exemplo. Depois:

```bash
npm run dev
```

Aplicação em <http://localhost:3000>.

### Conta de teste

| e-mail                | senha        |
| --------------------- | ------------ |
| `helena@decorar.test` | `decorar123` |

Também existem `tomas@`, `julia@` e `rafael@decorar.test` com a mesma senha.
Helena e Tomás têm loja; os outros dois vendem como pessoa física.

---

## Stack

| Camada       | Escolha                          | Por quê                                                                       |
| ------------ | -------------------------------- | ----------------------------------------------------------------------------- |
| Framework    | Next.js 15 (App Router)          | Server Components + Server Actions: mutação sem camada de API para manter      |
| Linguagem    | TypeScript strict                | Erros de contrato aparecem no editor, não em produção                          |
| Banco        | Prisma + SQLite                  | Zero infraestrutura para rodar local; migra para Postgres trocando uma linha   |
| Estilo       | Tailwind CSS v4                  | Tokens de design em `@theme`, sem arquivo de config para manter sincronizado   |
| Sessão       | `jose` (JWT) + `bcryptjs`        | Compatível com o runtime edge do middleware, sem dependência de serviço externo |
| Validação    | Zod                              | Um schema serve para o formulário e para a Server Action                       |
| Animação     | IntersectionObserver + CSS       | Sem biblioteca de animação: menos JS no bundle e 60fps garantido               |

Nenhum serviço externo é necessário — o projeto sobe offline depois do
`npm install`.

### Migrando para PostgreSQL

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `"postgresql"`.
2. Aponte `DATABASE_URL` para o banco.
3. `npx prisma db push`.

O schema não usa enums nativos nem tipos exclusivos do SQLite, então não há
nada além disso a ajustar.

---

## Segurança

Cada item abaixo está implementado, não é planejamento.

**Autenticação**

- Senhas com bcrypt, custo 12 (`src/lib/auth.ts`).
- Sessão em JWT HS256 assinado com `AUTH_SECRET`, em cookie `httpOnly`,
  `sameSite=lax`, `secure` em produção. O token nunca chega ao JavaScript.
- `sessionVersion` no usuário: trocar a senha ou usar "sair de todos os
  dispositivos" invalida instantaneamente todas as sessões emitidas antes.
- Login com e-mail inexistente ainda executa um bcrypt descartável, para o
  tempo de resposta não revelar quais e-mails têm conta.
- Mensagem de erro genérica ("E-mail ou senha incorretos") nos dois casos.

**Autorização**

- `src/middleware.ts` barra `/painel`, `/anuncios/novo` e `/favoritos` sem sessão.
- **Toda** página e Server Action revalida no servidor (`requireUser`), porque
  middleware sozinho nunca é garantia — ele não consulta o banco.
- Update, delete e troca de status conferem `sellerId === user.id` antes de
  tocar no registro. Editar anúncio alheio devolve 404.
- Anúncio em rascunho ou pausado só é visível para o dono.

**Entrada**

- Todo formulário e toda querystring passam por schema Zod antes de virar
  consulta. Parâmetro fora do enum vira `undefined`, não chega ao banco.
- Prisma parametriza as consultas — não há SQL montado por concatenação.
- Preços trafegam em centavos (inteiros), nunca em ponto flutuante.

**Upload**

- Tipo verificado por *magic bytes*, não pelo `Content-Type` do cliente — SVG
  com script embutido e executável renomeado são recusados.
- Limite de 5 MB por arquivo e 8 por anúncio.
- Nome do arquivo é um UUID gerado pelo servidor: o nome enviado pelo cliente
  nunca toca o disco.
- Ao remover uma imagem do anúncio, o arquivo é apagado (com o caminho
  resolvido e conferido contra *path traversal*).
- A Server Action só aceita URLs sob `/uploads/` — não dá para injetar uma URL
  externa no anúncio.

**Abuso**

- Rate limit por IP e por e-mail no login, no cadastro, na troca de senha e no
  upload (`src/lib/rate-limit.ts`).
- Telefone do vendedor só é renderizado após clique explícito.

**Cabeçalhos** (`next.config.mjs`)

CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy` e HSTS em produção.

### O que falta para produção

- **Rate limit em memória.** Funciona em instância única. Com múltiplas
  instâncias, trocar o `Map` por Redis mantendo a mesma assinatura.
- **CSP com `unsafe-inline`.** Necessário para o bootstrap do Next; endurecer
  com nonce por requisição.
- **Uploads em disco local.** Em ambiente serverless (Vercel), migrar para
  S3/R2 — só `src/lib/uploads.ts` muda.
- **Sem verificação de e-mail nem recuperação de senha.**
- **Sem pagamento.** A negociação é direta entre as partes, por WhatsApp.

---

## Estrutura

```
src/
├─ actions/          Server Actions (auth, listings, profile, store, favorites)
├─ app/
│  ├─ (site)/        Landing, busca, anúncio, loja, favoritos
│  ├─ (auth)/        Login e cadastro
│  ├─ painel/        Área logada
│  ├─ api/uploads/   Recebimento de imagens
│  └─ sair/          Encerra sessão e quebra laço de redirect
├─ components/
│  ├─ brand/         Logo
│  ├─ landing/       Hero, parallax, busca
│  ├─ listing/       Galeria, formulário, uploader, contato
│  ├─ painel/        Navegação e formulários da área logada
│  ├─ search/        Filtros
│  └─ ui/            Botão, campos, badge
├─ lib/              db, auth, session, validators, uploads, rate-limit, taxonomy
└─ middleware.ts     Primeira camada de proteção de rota
```

---

## Imagens

O projeto usa duas fontes, de propósito:

**Ilustrações geradas por código** (`src/components/ProductPlate.tsx`) — usadas
nas categorias, no hero, no rodapé, nas páginas de erro e como fallback de
qualquer anúncio sem foto. São SVG desenhado em código: carregam
instantaneamente, funcionam offline e mantêm a paleta da marca exata. No banco
aparecem como `art:<categoria>#<seed>`.

**Fotos reais** nos anúncios de exemplo, baixadas do
[Openverse](https://openverse.org) (CC0 / domínio público) e normalizadas para
JPEG 1600×1200:

```bash
npm run seed:images
```

As fotos vão para `public/uploads/seed/` e o mapa fica em
`prisma/seed-images.json`. Para curar manualmente: apague os arquivos que não
gostou, rode `npm run seed:manifest` e depois `npm run db:seed`.

> O acervo público não tem foto boa de tudo. O anúncio "Par de espelhos" ficou
> sem foto adequada e usa a placa ilustrada — é o comportamento previsto.

---

## Scripts

| Comando                | O que faz                                              |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Servidor de desenvolvimento                            |
| `npm run build`        | Build de produção                                      |
| `npm run typecheck`    | `tsc --noEmit`                                         |
| `npm run setup`        | Prisma generate + db push + seed                       |
| `npm run db:reset`     | Zera o banco e popula de novo                          |
| `npm run db:studio`    | Prisma Studio                                          |
| `npm run seed:images`  | Baixa fotos reais para os anúncios de exemplo          |
| `npm run seed:manifest`| Reconstrói o manifesto a partir dos arquivos em disco  |

---

## Funcionalidades

- **Landing** com hero ilustrado em parallax, animações de rolagem, vitrine de
  curadoria, categorias, manifesto e depoimentos.
- **Cadastro e login** com validação em tempo real da força da senha.
- **Anúncios**: criar, editar, pausar, marcar como vendido, excluir. Até 8
  imagens com reordenação e definição de capa.
- **Busca** por texto (sem acento — "sofa" encontra "Sofá"), categoria,
  conservação, cidade, UF, faixa de preço e disponibilidade de entrega, com
  ordenação e paginação.
- **Favoritos** com atualização otimista.
- **Loja**: página pública com endereço próprio, capa, descrição e contato.
- **Configurações**: perfil, troca de senha, encerrar todas as sessões e
  exclusão de conta com dupla confirmação.
