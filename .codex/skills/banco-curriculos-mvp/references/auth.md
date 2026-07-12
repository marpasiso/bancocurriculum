# Auth and Session Rules

- Use users only for `ADMIN` and `EMPLOYER`.
- Do not create candidate login.
- Hash passwords with bcrypt before saving.
- Store sessions server-side and set only an opaque cookie in the browser.
- Use `httpOnly`, `sameSite=lax`, `secure` in production, and explicit expiry.
- Select safe user fields only: `id`, `email`, `role`, and minimal employer data.
- Admin-only actions must call the admin guard before touching sensitive data.
- Employer-only actions must call the employer guard and verify the employer record.
- Log admin login and sensitive auth-adjacent actions in `AuditLog`.
