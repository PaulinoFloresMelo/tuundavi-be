# bun-hono

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run server.ts
bun run dev
```

This project was created using `bun init` in bun v1.2.23. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

To genere a secret word for JWT
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```