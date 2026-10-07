# DARE Ecosystem Architecture

Brand: **DARE — Africa's Knowledge & Data Intelligence Infrastructure.**
Tagline: **Africa's Knowledge, Connected.**

This is a shared-platform architecture. Applications stay independently
deployable; they converge on contracts, not on a monorepo.

## 1. Core principle

**One knowledge object. Many experiences.** A PDF entering the Unified
Repository becomes available to Library, AI, Librarian, Research, Learn,
Tutor and Create without duplicating the authoritative source. A dataset
likewise powers Data, Research, AI and Library from one record.

## 2. Layers and sources of truth

| Layer | System | Source-of-truth rule |
|---|---|---|
| Authoritative source content | Unified Repository (DSpace 9.3) | Originals live here and only here |
| Normalized intelligence index | DARE Intelligence (`dare-canonical-1.0.0`) | Metadata copies + derived index; provenance mandatory; heuristics labelled in `dare_inferences` |
| Generated/derived intelligence | DARE AI | Summaries, answers, guides; **never** confused with originals; every factual claim cites a source |

Knowledge flow: External source → DARE Harvest → validation → provenance →
Unified Repository → DARE Intelligence → knowledge graph/index → DARE AI →
applications.

## 3. Conceptual stack (strategy)

African Sources → DARE Harvest → Unified Repository → DARE Intelligence →
Knowledge Graph + Research Graph + Data Graph → DARE AI → People.

## 4. Deployed topology (audited 2026-10-07, localhost unless stated)

- DSpace REST `:8080` (docker `dare-dspace`) + Angular SSR `:4000` →
  `unifiedrepository.dare.co.zw` (`/server/*` → 8080, `/librarian/*` → 8095)
- Intelligence api `:8091`, mcp `:8092`, web `:8093`, pgvector db `:5434`
  (docker `dare-intelligence-*`, running)
- Library web `:3030` (`darelibrary.dare.co.zw`); diglib api `:8096` + web
  `:3020` (`library.dare.co.zw`); Zotero bridge `:8090` (localhost only)
- Librarian `:8095`; Learn api `:8097` (`learn.dare.co.zw`); Open Books
  `:3010`; Cloud api `:8081` (`cloud.dare.co.zw`); AFRIVA `:8088`;
  Famba `:3100–3114` + own DB; HBC wizzard `:8100`; Ollama `:11434`
- Data planes: DSpace PG/Solr (`:5432/5433`, `:8984`), intelligence PG
  (`:5434`), Learn PG (`:55433`), diglib tables inside `dare_auth` PG,
  studio/AFRIVA/Famba/zivaai stores — all separate engines.

## 5. What is real vs missing (audit verdicts)

- Real and reusable: `dare_intel/` library (models, normalize, countries,
  geo, institutions, licenses, readiness v2, datasets, embeddings, search,
  provenance, serializers, intelligence), idempotent schema bootstrap,
  polite DSpace/OAI clients, pgvector+FTS+trigram search core, provenance
  chains, storage classes, API/MCP scaffolding, compose topology.
- Broken (repair before reuse): `/search`, `/ask`, `search_research` MCP
  tool (missing `hybrid_search`/`keyword_query`); `harvest.py` +
  `inventory.py` vs current client; unresumable `embed_worker`.
- Empty (populate before scaling): `sources` registry (0 rows),
  institutions (0), countries (0), `dataset_files` (0); `resource_type`
  null on old rows; `research_items.country_code` ~null.
- Absent (greenfield): DARE AI service, knowledge-graph entity resolution,
  dataset variable-level analysis, African-language infra, shared identity,
  scheduler/daemon, write-back client, source adapters beyond DSpace.
- Stale docs in intelligence repo: `AI_READINESS` (v1 vs code v2),
  `API.md` (claims working `/search`), `HARVESTING.md` (claims working
  inventory) — refresh alongside repairs.

## 6. Non-goals (binding)

No merging repos into one codebase. No mass migrations. No deleting apps.
No rewriting unrelated projects. No production changes. No destructive git
operations. No direct access to DSpace PostgreSQL/assetstore or to another
app's internal tables — service boundaries only.
