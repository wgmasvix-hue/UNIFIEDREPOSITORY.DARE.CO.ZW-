# DARE API Boundaries

Audited 2026-10-07 from configs, code, `ss`/`systemctl`/`docker ps`, and 3
localhost health GETs. No traffic was generated beyond those health checks.

## 1. Confirmed HTTP bases (127.0.0.1 unless stated)

| Base | Owner | Serves |
|---|---|---|
| `:8080/server/api` | DSpace 9.3 (`dare-dspace`) | Authoritative REST; fronted by `unifiedrepository.dare.co.zw/server/*` |
| `:4000` | dspace-angular SSR | Public UI; fronted by `unifiedrepository.dare.co.zw/` |
| `:8091/api/v1` | dare-intelligence api | Catalog + intel (research/datasets/authors/institutions/countries/topics/search/related/readiness/citations/statistics/sources/harvests/graph/ask) |
| `:8092` | dare-intelligence mcp | 12 read-only tools (`GET /mcp/tools`, `POST /mcp`) |
| `:8093` | intelligence web (Caddy) | Static discovery UI |
| `:5434` | intelligence pgvector PG | Internal only |
| `:3030` | dare-library web | `darelibrary.dare.co.zw`; client-only DSpace reads |
| `:8096` + `:3020` | diglib api + web | `library.dare.co.zw`; catalogue/auth/zotero/harvest |
| `:8090` | zotero bridge | OAI + items API; localhost + diglib proxy only (good) |
| `:8095` | dare-librarian | `/api/search|ask|item|community`; fronted under unifiedrepository `/librarian/*` |
| `:8097/api` | learn v3 | `learn.dare.co.zw`; tutors/quiz/memory/library |
| `:8081/api/v1` | dare-cloud api | `cloud.dare.co.zw`; servers/billing |
| `:8088/api` | AFRIVA studio | `research.chengetailabs.co.zw`; adjacent commerce |
| `:3100–3114` | famba-* | Independent ops app + own DB |
| `:3010` | open-books web | Scaffold |
| `:8100` | hbc wizzard | Overlaps Learn HBC — later dedup |
| `:8180` + `:4100` | irbyopoly pair | Isolated side project |

Angular frontend (`dare-dspace-angular`) calls DSpace REST only
(`localhost:8080`); zero references to `:8091/:8092/:8095`.

## 2. Who calls whom

dare-library → DSpace REST. librarian → DSpace REST + Groq. diglib →
DSpace REST + bridge `:8090` + Open Library. AFRIVA → DSpace/OAI + scholar
APIs (outbound). cloud console → cloud api (same-origin). Learn →
own PG/SQLite + Groq + public scholar APIs (no DARE service calls).
Famba/irbyopoly: isolated.

## 3. Boundary violations to fix (in priority order)

1. Diglib open edge: `allow_origins=["*"]` + credentials, harvest ops open
   when admin token unset — explicit origins, token required, 401 default.
2. N× divergent direct DSpace query shapes — consolidate behind one
   search gateway; apps drop raw DSpace URLs over time.
3. Auth fragmentation (diglib session+ORCID, cloud sessions, AFRIVA admin
   token, deploy JWT) — one IdP target; see DARE_IDENTITY_STRATEGY.md.
4. Bridge `POST /api/items` trusts localhost — bearer token + caller
   allow-list.
5. Cloud `:8099` second listener unexplained; verify live `dist` matches
   audited `src` (historical mock/secret-capture findings).

## 4. Proven-clean (keep enforcing)

No app touches DSpace Postgres/assetstore directly; enrichment writes only
to `external_records`/`citations`; harvesters are GET/HEAD-only; no DSpace
write client/credentials exist anywhere (which also means write-back is
currently impossible — a deliberate safety property until designed).
