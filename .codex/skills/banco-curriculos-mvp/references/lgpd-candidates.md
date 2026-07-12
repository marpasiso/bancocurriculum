# Candidates and LGPD Rules

- Candidate registration is public and does not create a user account.
- Server validation must require LGPD consent.
- Save a `ConsentSnapshot` with version, text, accepted timestamp, and request metadata when available.
- Public LGPD requests create `LgpdRequest` and `AuditLog`; they never delete data automatically.
- Candidate listing/search must never include references or unrelated sensitive fields.
- Candidate details can show more data only after employer access is authorized.
- Do not implement uploads for resumes or documents in this MVP.
- Preserve clear README steps for testing candidate registration, consent, and LGPD request flows.
