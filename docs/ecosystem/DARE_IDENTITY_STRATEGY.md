# DARE Identity Strategy (target — do not migrate yet)

Explicit scope: document the target only. **No global authentication
migration is authorized by this document.** Any migration is a separate,
risk-reviewed proposal.

## 1. Current state (fragmented — audited)

- dare-digital-library: server sessions + local accounts + ORCID
  (`/auth/*`) — the most complete seed.
- dare-cloud: HMAC-signed sessions.
- AFRIVA studio: `ADMIN_TOKEN` + account emails.
- chengetai-deploy: JWT (`admin > engineer > viewer`).
- Learn v3: server sessions + optional Supabase auth.
- DSpace: its own REST auth (Angular `auth` config, token refresh).
- Intelligence/Librarian APIs: optional API-key gate + `api_usage` metering.

## 2. Target model

One DARE identity: a user moves across Library, Learn, Research, Data and
Create without creating unrelated identities. One IdP (OIDC), ORCID linked
once at the identity (researcher graph joins on it), per-app roles stay
local to each app, service-to-service via scoped tokens. DSpace auth
remains the repository's own gate until a bridge is designed — never
worked around.

## 3. Path (sequenced, each step separately approved)

1. Freeze this target + inventory PII/secret stores per app.
2. Harden what exists (diglib CORS/token, bridge bearer, cloud secrets).
3. Stand up IdP beside — not in front of — production; pilot on one
   low-risk app (Open Books or Create, when functional).
4. Migrate app by app with dual-run + rollback; repository and payments
   last. Famba stays independent; it consumes platform services, never
   shares the identity store until it opts in.

## 4. Non-goals

No shared passwords across apps, no merging user tables by hand, no
production auth cutover without dual-run evidence.
