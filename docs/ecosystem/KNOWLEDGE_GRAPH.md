# Knowledge Graph

## 1. Entities and relations

Researcher ↔ Institution ↔ Research ↔ Dataset ↔ Country ↔ Region ↔ Topic,
plus Publication, PDF, Book, Project, Subject, Funding source, Date,
Geographic area. Canonical path: Researcher → Institution → Research →
Dataset → Country → Topic. Relation types stay explicit (authorship,
affiliation, aboutness, coverage, funding, reuse, citation, topic overlap);
co-occurrence is never presented as a verified relation.

## 2. Powers

Related research and datasets; institution/researcher discovery; country
knowledge pages; topic pages; dataset reuse/impact indices; visibility
reporting per country (open access, DOI, abstracts, readiness, licensing
gaps). Much of this exists as library functions (`intelligence.py`) but is
unreachable over HTTP — exposure, not invention, is the first step.

## 3. Current state vs target

Today: join tables + five fixed graph routes + string-level authors/topics
— a thin query layer, not a graph. Missing: entity resolution (authors are
strings; ORCID only where sourced), dedup/merge, typed relations beyond
co-authorship/overlap, traversal API, DSpace-side provenance fields. Order
of work: (1) populate institutions/countries via classifiers; (2) wire
existing library functions to API/MCP; (3) ORCID/ROR resolution;
(4) typed relations + reuse/citation edges; (5) country/topic/institution
pages in Library/Research/Data. No inferred geography or fabricated links
at any stage.
