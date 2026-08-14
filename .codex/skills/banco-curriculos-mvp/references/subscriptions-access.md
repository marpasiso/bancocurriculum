# Subscriptions and Employer Access Rules

- Employer search and candidate detail pages require an active subscription.
- Active means `startsAt <= now` and `endsAt > now`.
- Expired or missing subscriptions must block both search and details.
- Candidate detail access must create `CandidateView` in the same business flow before returning details.
- Candidate detail access must create `AuditLog`.
- Search/listing responses must select fields explicitly and exclude references.
- Do not bypass access checks from UI code; checks belong in module services.
- Keep the 7-day activation rule centralized in the subscriptions module.
