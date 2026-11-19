# Deploy gratuito em produção

Stack 100% free tier: **MongoDB Atlas M0** (banco) + **Render** (API NestJS) + **Vercel** (front Nuxt).

```
Vercel (front)  ──HTTPS──▶  Render (API :443)  ──▶  MongoDB Atlas M0
```

## 1. MongoDB Atlas (banco)

1. Criar conta em <https://www.mongodb.com/atlas> → **Build a Cluster** → plano **M0 (Free)**.
2. Em **Database Access** → criar usuário `sistema-nutri` com senha forte.
3. Em **Network Access** → **Add IP Address** → `0.0.0.0/0` (o Render free não tem IP de saída fixo).
4. **Connect → Drivers → Node.js** → copiar a connection string e trocar `<senha>`:
   ```
   MONGO_URI=mongodb://sistema-nutri:<SENHA>@cluster0.xxxxx.mongodb.net/sistema-nutri?retryWrites=true&w=majority
   ```

## 2. Back-end no Render

1. <https://render.com> → **New → Blueprint** → conectar `rodrigospicker1/sistema-nutri`.
   O `render.yaml` na raiz já configura build/start/health check.
2. Preencher as env vars marcadas `sync: false`:
   - `MONGO_URI` → string do Atlas (passo 1)
   - `CORS_ORIGIN` → `https://<seu-app>.vercel.app` (preencher depois do passo 3 e voltar aqui)
   - `OBSERVE_APP_KEY` / `OBSERVE_APP_SECRET` → opcional
3. Deploy → anotar a URL `https://sistema-nutri-api.onrender.com`.
4. Testar: `curl https://sistema-nutri-api.onrender.com/health` → `{"status":"ok"}`.

**Cold start**: o plano free dorme após ~15 min sem tráfego; a primeira request demora ~30-60 s. Aceitável para uso interno; se incomodar, Render pago ($7/mês) ou Koyeb free (sem sleep).

## 3. Front-end na Vercel

1. <https://vercel.com> → **Add New → Project** → importar o mesmo repositório.
2. **Root Directory**: `front-end`.
3. Framework preset: **Nuxt.js** (detectado automaticamente; build `nuxt build`, output `.output`).
4. Env var: `NUXT_PUBLIC_API_BASE=https://sistema-nutri-api.onrender.com`.
5. Deploy → anotar `https://<projeto>.vercel.app`.
6. **Voltar ao Render** e ajustar `CORS_ORIGIN` para essa URL → redeploy do back-end.

## 4. Popular o banco (seed)

O seed (`back-end/scripts/seed.ts`) **limpa as collections** antes de popular — rode uma única vez em produção:

```bash
cd back-end
MONGO_URI="mongodb+srv://..." npx tsx scripts/seed.ts
```

⚠️ Nunca rode o seed de novo em produção sem backup — ele recria o banco do zero.

## 5. Checklist de produção

- [ ] `CORS_ORIGIN` restrito à URL da Vercel (não deixar vazio em prod)
- [ ] Senha do Atlas forte + `0.0.0.0/0` apenas se necessário
- [ ] `OBSERVE_*` configurado ou removido (sem chave o módulo usa placeholder e não reporta)
- [ ] Erudio: o provider atual é **mock** — matrículas/demandas vêm dos dados de exemplo até a integração real
- [ ] Backup: agendar `mongodump` periódico (Atlas M0 não tem backup gerenciado)

## Variáveis de ambiente — resumo

| Variável | Onde | Obrigatória |
|---|---|---|
| `MONGO_URI` | Render (back) | sim |
| `CORS_ORIGIN` | Render (back) | sim em prod |
| `PORT` | Render injeta | não (default 3000) |
| `NUXT_PUBLIC_API_BASE` | Vercel (front) | sim |
| `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET` | Render (back) | não |
