# DARE Architecture (conceptual)

Companion to DARE_ECOSYSTEM_ARCHITECTURE.md (deployed reality). This file
is the concept; that file is the ground truth.

## 1. Layers

1. **African Sources** — repositories, NSOs, journals, publishers,
   government gazettes, open-data portals, institutional collections.
2. **DARE Harvest** — polite, read-only, ledgered ingestion (REST + OAI;
   incremental via cursors; per-item isolation; raw payload preserved).
3. **Unified Repository** — DSpace; the authoritative store. Reuse-first
   community mapping (e.g. existing `Africa Research` community, subject
   communities) — no vanity communities.
4. **DARE Intelligence** — normalization (`dare-canonical-1.0.0`),
   enrichment (external records isolated from core fields), provenance,
   dataset detection, AI-readiness, embeddings, hybrid search.
5. **Graphs** — Knowledge + Research + Data graphs (see KNOWLEDGE_GRAPH.md).
6. **DARE AI** — grounded gateway (see DARE_AI_ARCHITECTURE.md).
7. **People** — Library/Learn/Tutor/Cheryl/Create/Research/Data/Library
   experiences over one knowledge object.

## 2. Harvest doctrine

Legally ingestible only; "all discoverable and legally ingestible
resources" — never "all data". Source registry populated with kind,
protocol and licence before new harvests; licence gate enforced
(unknown/restricted = link-only); no mass harvest without plan; scheduler
and OAI→registry ingestion are the next harvest investments; the
harvester/client drift is repaired before any new source adapter.

## 3. Data model notes

21+ tables keyed `(source_system, source_id)`; datasets one row per
(record, source) with storage classes; bitstream metadata, never bytes;
identifiers unique per (record, scheme, value); citations/external records
separate from core; `dare_inferences` labels every heuristic. Adopt the
canonical model everywhere; merge the three competing serializers and the
three enum conflicts rather than adding more.
