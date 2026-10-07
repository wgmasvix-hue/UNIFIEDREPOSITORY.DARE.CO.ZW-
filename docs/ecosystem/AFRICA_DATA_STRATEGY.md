# Africa Data Strategy

## 1. Knowledge layer (first-class resources)

Research papers, theses, dissertations, books, reports, policy documents,
educational resources, government publications, datasets, statistical
publications, geospatial resources, open data, institutional repositories.
Each carries: provenance, source, country, region, institution, creators,
date, subject, resource type, license/rights, original identifier.

## 2. Data layer (datasets as first-class citizens)

Domains: national statistics, agriculture, food systems, health, education,
climate, environment, biodiversity, economics, finance, population, census,
transport, energy, geospatial, development, science & technology, public
policy. Built around the existing harvest architecture; objective is
discovering and legally ingesting as much openly accessible African data as
possible. Existing seeds: `dare-data/ahad` staging, `dare-datasets`
(MasakhaNER 2.0 incl. Shona), 34 datasets already indexed with readiness
cards, `DatasetFile` metadata model ready for schema/row/column detail.

## 3. Africa-first taxonomy

Canonical model exists in code (`countries.py`: 54 UN states + regions/
subregions/aliases; `iso_countries.py`: global ISO; `geo.py`: five
disjoint geographies — author/institution/study/dataset/repository —
with evidence + confidence, never collapsed; `institutions.py`:
classify-before-create + curated gazetteer). Required additions: AU + RECs
(SADC, COMESA, ECOWAS, EAC, IGAD, AMU, CEN-SAD) as first-class entities;
discovery by country/region/sub-region/institution/city/coordinates.
Populate the empty `countries`/`institutions` tables through the
classifiers — never the naive backfill (it would mint thousands of
`Zenodo`-as-institution rows).

## 4. Data for African AI (machine-readable access)

Authorized consumers discover datasets, metadata, research, documents,
institutions, researchers, coverage and topics via stable APIs + MCP tools
with identifiers and provenance. Missing tools to add: dataset variables/
provenance/license, similar datasets, `describe_dataset_for_ai`,
`recommend_datasets_for_question`, faceted search, source status.

## 5. AI-ready data (explainable scores, evidence only)

Readiness v2 scores 10 dimensions (weights sum 1.0) with per-dimension
reasons + disclaimer; bands excellent→minimal; 3-axis licence model
(access/redistribution/ai_use; unknown never upgraded). Gaps to close:
doc/code version skew, duplicate rows per re-harvest, variable-level
inputs, file-content profiling (metadata-only today, by design).
