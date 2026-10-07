# DARE Platform Contract

The minimum shared contract every DARE application converges on. New
capabilities are added here once — never re-implemented per app.

## 1. Contract domains

Authentication · authorization · repository API · search · AI gateway ·
document processing · embeddings · vector search · knowledge graph ·
provenance · citations · datasets · research · institutions · researchers ·
analytics · notifications (where appropriate).

## 2. Source-of-truth rules

1. Unified Repository holds authoritative content. Nothing else stores a
   competing "original".
2. Intelligence holds normalized copies + derived index with mandatory
   provenance (`source_system`, `source_id`, `source_url`, untouched
   `ingest_metadata`, labelled `dare_inferences`).
3. AI outputs are generated/derived intelligence, always labelled, always
   cited. Model-generated content is never presented as the scholarly
   record. Storage classes stay explicit: `dare_hosted` (bytes served by
   DARE) vs `harvested_metadata` vs `externally_hosted`.
4. Never invent: no fabricated findings, no quality scores without
   evidence, no inferred geography the source doesn't support, no language
   support claims ahead of implementation.

## 3. Canonical resource model

Every DARE resource (dataset, publication, PDF, book, thesis, report, OER,
project, institution, researcher, course) supports: stable identifier ·
title · description · creators · institution · country · subject · date ·
resource type (17-value `RESOURCE_TYPES`) · source · provenance · license ·
repository URL · AI/indexing status. Canonical version:
`dare-canonical-1.0.0` — adopt it; do not create a fifth competing model
(four already exist across the ecosystem).

African-resource metadata adds: provenance, source, country, region,
institution, creators, date, subject, resource type, license/rights,
original identifier. Coverage language is always
"all discoverable and legally ingestible resources" — never "all data".

## 4. API-first rules

- Apps communicate through stable versioned HTTP APIs + MCP tools.
- Forbidden: direct reads/writes to DSpace PostgreSQL, DSpace assetstore,
  or another application's internal tables.
- Read paths go through repository API → search gateway → intelligence
  index. Write-back to DSpace (if ever scoped) goes through one ingest
  client with credentials, mapping, and audit — which does not exist yet
  and is therefore out of scope until designed.
- Every object crossing a boundary carries provenance; every AI claim
  carries citations back to authoritative URLs.

## 5. Minimal shared services (build/keep)

Keep: DSpace REST/OAI, intelligence REST+MCP, Zotero bridge, Caddy edge.
Repair: intelligence search/ask path, harvester-vs-client drift, diglib
open harvest edge + CORS.
Build once: AI gateway, search gateway, shared identity (target only —
no migration yet), dataset variable/analysis jobs, African-language
pipeline, scheduler, source adapters (DataCite/OpenAlex/GBIF/NSOs).
