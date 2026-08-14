# Local Testing and Deployment Compatibility

- Keep the app runnable with `npm install`, `.env`, Prisma migrations, seed, and `npm run dev`.
- Target local MySQL/MariaDB through `DATABASE_URL`.
- Keep `.env.example` current when environment variables change.
- Keep Prisma migrations versioned so a fresh database can be created without guessing.
- Seed must create an initial admin and document credentials in `README.md`.
- README must explain testing as candidate, employer, and admin.
- Keep compatibility with Node.js and managed hosting/CyberPanel; avoid dependencies that require unusual daemons.
- Prefer `next.config.mjs` settings that can be deployed with a standard Node.js process.
