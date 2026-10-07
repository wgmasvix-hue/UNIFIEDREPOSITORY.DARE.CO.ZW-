# DARE AI Architecture

DARE AI is the user-facing grounded-intelligence layer over the
intelligence index. It is **not** a generic chat clone: repository
discovery stays central, and every factual response is grounded in DARE
sources with citations to authoritative resources.

## 1. Common capabilities (one implementation, all apps consume)

ASK · SUMMARIZE · EXPLAIN · STUDY · ANALYSE · COMPARE · DISCOVER ·
RESEARCH — exposed once through the AI gateway (REST + MCP), consumed by
Library, Librarian, Research, Data, Learn, Tutor, Cheryl, Create.

## 2. Experience contracts

- **ASK DARE:** question → grounded answer + citation list. Retrieval-only
  today (`POST /ask` renders ranked evidence); generation comes only with
  a citation-enforcement + eval harness. No answer without sources.
- **READ:** open the original document/dataset at its repository URL.
- **STUDY:** summary, key concepts, definitions, questions, flashcards,
  study guide, quiz, discussion questions — derived, labelled, regenerable.
- **ANALYSE (datasets):** schema, variables, missingness, geographic and
  temporal coverage, basic descriptives, AI-readiness, suggested research
  questions. Never fabricate findings; missing evidence is stated.
- **COMPARE/DISCOVER/RESEARCH:** graph-powered related research/datasets,
  institution/researcher/country/topic pages.

## 3. Grounding and provenance rules

Retrieval from the intelligence index (hybrid FTS+trigram+pgvector+RRF);
provenance object on every item; claim-level citation spans as the target;
`source-backed / model-generated / unverified` labels on all output;
originals never overwritten by derivatives.

## 4. Build order

1. Repair retriever (`hybrid_search` wiring; currently the ask path 500s).
2. Provenance-on-every-object already exists — enforce at the gateway.
3. Add generator with citation enforcement + eval set (sample success
   questions: maize post-harvest losses in Zimbabwe; maternal-health
   datasets; climate-change institutions in Southern Africa).
4. Study/analyse jobs (variable-level metadata, profiling, readiness
   explanations).
5. African-language pipeline (detection → multilingual metadata/search →
   translated summaries, source-language preserved) — §5 of strategy;
   zero base exists today, no claims until it does.
6. Model layer: one embedding-model decision (stored vectors are
   hashing-v1 — resolve drift first), optional reranker, no biggest-model
   race: intelligence around African realities is the differentiator.

## 5. Safety

Gateway holds all provider keys server-side (Groq exclusive today);
model allow-list; rate limits + `api_usage` metering; no training on
restricted content; license gate (unknown/restricted = link-only).
