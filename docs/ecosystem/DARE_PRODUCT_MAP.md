# DARE Product Map

Read-only audit synthesis, 2026-10-07. Sources: direct audits of
`/opt/dare-intelligence` (code + docs), Learn/Tutor/Create/OpenBooks group,
platform/data/cloud group, live `ss`/`systemctl`/`docker ps`, and the
`dare-dspace-angular` repo. Nothing was modified, run, or deployed to produce
this document.

Brand: **DARE — Africa's Knowledge & Data Intelligence Infrastructure.**
Tagline: **Africa's Knowledge, Connected.**

## 1. Core infrastructure (Phase 1)

| Application | Location | Current API | Current role | Dependencies | Future role | Priority | Migration risk |
|---|---|---|---|---|---|---|---|
| Unified Repository (DSpace 9.3) | docker `dare-dspace` `:8080`; UI `dare-dspace-angular` `:4000`; `unifiedrepository.dare.co.zw` | DSpace 7 REST `/server/api` + OAI-PMH; Angular SSR | **Authoritative source content.** ~350k items; `Africa Research 123456789/23` reuse target | Postgres/Solr/assetstore (internal only) | Unchanged: authoritative repository | P0 | None (do not touch) |
| DARE Intelligence | `/opt/dare-intelligence`; api `:8091`, mcp `:8092`, web `:8093`, db `:5434` (all containerised, running) | `/api/v1/*` catalog+intel, 12 MCP tools, static web | Normalized intelligence index: 6000 research, 34 datasets, readiness v2, embeddings, provenance | DSpace REST/OAI read-only; own pgvector DB | Intelligence/discovery/enrichment layer; fix broken `/search`+`/ask` wiring first | P0 | Med (repair, don't rewrite) |
| DARE AI | Does not exist yet as a service; fragments in Librarian `:8095`, Learn `:8097`, AFRIVA | — | — | — | Grounded AI gateway (ASK/SUMMARIZE/EXPLAIN/STUDY/ANALYSE/COMPARE/DISCOVER/RESEARCH) | P0 | Greenfield; see DARE_AI_ARCHITECTURE.md |
| DARE Library (public front door) | `/opt/dare-library` (Next.js `:3030`, `darelibrary.dare.co.zw`); catalogue service `/opt/dare-digital-library` (api `:8096`, web `:3020`) | Client-only DSpace reads; diglib `/api/*` + `/auth` + `/zotero` + harvest ops | Public discovery/reading; unified search + harvest + local auth + Zotero save | DSpace REST; own PG (`library_*` in `dare_auth` DB); Zotero bridge `:8090` | Public front door: Discover/Search/Read/Ask/Study/Research/Datasets/Books | P1 | Med (diglib schema + open harvest edge — fix per API_BOUNDARIES) |
| DARE Research | No dedicated app; capability split across Intelligence `/graph/*`, Librarian, AFRIVA studio | — | — | — | Research/researcher/institution discovery on the knowledge graph | P1 | Greenfield UI; graph needs entity resolution first |
| DARE Data | No dedicated app; `dare-data/ahad` + `dare-datasets/{cut,masakhaner2}` are content stores, not apps | — | — | — | Dataset discovery, schema inspection, AI-readiness, data intelligence | P1 | Greenfield UI over existing `datasets` model |

## 2. Learning & creation (Phase 2)

| Application | Location | Current API | Current role | Dependencies | Future role | Priority | Migration risk |
|---|---|---|---|---|---|---|---|
| DARE Learn | `/opt/dare-learn-production-v3` (React+Vite frontend; FastAPI `:8097`; `learn.dare.co.zw`) | `/api/*` (auth/chat/memory/library/sources/tools/sandbox/tutor/quiz) | Full learning product: student/teacher/admin, Knowledge Library + FTS5, tutor memory PG, Food Science | Own PG + SQLite + Supabase (optional); Groq; OpenLibrary/OpenAlex/Crossref | Consume DARE knowledge via platform APIs; keep tutor memory local | P2 | Med (bespoke memory schema + on-disk library) |
| DARE Tutor / Mr Garikai | Inside Learn v3 (`university` collection + Garikai UI); `/opt/open-tutor-ai` is a data file only, not runnable | via Learn `:8097` | Tertiary academic assistance | Same as Learn | Tertiary persona over approved DARE resources | P2 | Low (as part of Learn) |
| Cheryl | Persona inside Learn v3 (no standalone service; `/opt` has no cheryl service) | via Learn `:8097` | Curriculum-aware school assistant | Same as Learn | School persona; curriculum-aware APIs | P2 | Low |
| DARE Create | `/opt/dare-create-v0.2` (static single-file studio) | None (file-served; `create.*` → `/srv/dare-create`) | Creative-learning prototype, project JSON export | None | Creation layer; approved works publish into DARE via workflow (never auto-publish) | P2/P3 | Low |
| DARE Librarian (assistant) | `/opt/dare-librarian` (FastAPI `:8095`) | `/api/search`, `/api/ask`, `/api/item|community` | Evidence-first RAG over live DSpace + Groq | DSpace REST; Groq | Shared answer-service pattern behind the AI gateway | P1/P2 | Low (stateless) |

## 3. Publishing, cloud, adjacent (Phase 3)

| Application | Location | Current API | Current role | Dependencies | Future role | Priority | Migration risk |
|---|---|---|---|---|---|---|---|
| DARE Open Books Publisher | `/opt/dare-open-books` (FastAPI scaffold + Next.js `:3010`) | `/`, `/health` only | Landing mock; pipeline unbuilt | None wired | Publish open content into DARE with publishing provenance | P3 | Low to carry; scope risk Med (pipeline unbuilt) |
| DARE Cloud | `/opt/dare-cloud` (Go `:8081`) + `/opt/dare-cloud-new` (console); `cloud.dare.co.zw` | `/api/v1/*` servers/plans/billing | Infrastructure control plane (Contabo) | Contabo OAuth; `servers.json` | Infrastructure only; never coupled to DSpace internals | P3 | Med (billing correctness; unexplained `:8099` listener) |
| DARE Go / Famba | Docker `famba-*` (`:3100–3114`, own `famba-db`); no source dir under `/opt` | App-internal | Independent operational app | Own DB | Consume platform services only; no repo-internals coupling | P3 | High if coupled — keep isolated |
| AFRIVA Research Studio | `/opt/chengetai-research-os` (`:8088`, `research.chengetailabs.co.zw`) | `/api/*` commerce/workspace | Paid research-services studio (adjacent) | Outbound DSpace/OAI/scholar APIs only | Adjacent; integrate via search/citation APIs only | P3 | High if merged (payments) — don't |
| chengetai-deploy | `/opt/chengetai-deploy` (no active unit observed) | `:3000` fleet API | Ops tooling | Out-of-band containers | Ops only; out of runtime path | P3 | Low |
| irbyopoly-repository | `/opt/irbyopoly-repository` (`:8180`/`:4100`, own DB) | Side DSpace 10 stack | Side project | Isolated | Out of scope | — | None (leave alone) |

## 4. Deprecate later (not now)

- `dare-learn-v1-production`, `dare-learn-v1`, `dare-learn-v2` — superseded by v3.
- `/opt/dare-learn-api` — predecessor gateway; retire after v3 coverage confirmed (keep its `.env` — v3 `deploy.sh` inherits the Groq key).
- `dare-create` v0.1/v0.3/v0.4 dirs + zips + `v0.5-backup` — diff once, keep one canonical Create.
- Tutor lineage (`ziva-open-tutor-source`, `zivaai`, `ziva-ui-recovered`, tarballs, `hbc-exam-wizzard` overlap) — archive only after contracts freeze.
- In-file `*.backup-*`/`*.bak*` hygiene backlog inside v3 and Librarian.

## 5. Minimum shared services (from this map)

Auth/identity (greenfield; diglib `/auth`+ORCID as seed) · search gateway
(consolidate N× direct DSpace query shapes) · AI gateway (greenfield;
Groq allow-list + provenance labels) · citation/Zotero (keep `:8090` bridge)
· harvest/ingest jobs (one idempotent job model) · content-store policy
(authoritative bitstreams stay in DSpace assetstore).
