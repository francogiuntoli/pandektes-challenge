# Pandektes Case Law Extractor

This NestJS service ingests a case law document (HTML or PDF), extracts structured metadata with an LLM, and stores the result in PostgreSQL via Prisma. It also exposes an endpoint to retrieve and/or delete an extracted case.

## Tech Stack

- **NestJS 11** for the application framework
- **Prisma ORM** on top of **PostgreSQL**
- **OpenAI-compatible LLM** (uses the OpenAI Responses API by default)
- **Cheerio** / **pdf-parse** for lightweight text extraction prior to prompting the LLM
- **Passport.js + JWT** for stateless authentication
- **Swagger UI** for interactive documentation and testing

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for the local PostgreSQL instance)
- An OpenAI (or compatible) API key with access to a JSON-capable model

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Copy environment template and set secrets**
   ```bash
   cp .env.example .env
   ```
   Update `OPENAI_API_KEY`, `JWT_SECRET`, and the seed credentials before running migrations.
3. **Start PostgreSQL**
   ```bash
   docker compose up -d
   ```
4. **Generate the Prisma client & run the initial migration**
   ```bash
   pnpm exec prisma generate
   pnpm exec prisma migrate dev
   ```
5. **Seed a demo application user** (credentials taken from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`)
   ```bash
   pnpm db:seed
   ```
6. **Run the application**
   ```bash
   pnpm run start:dev
   ```

The server listens on `http://localhost:3000` by default. Interactive API docs live at `http://localhost:3000/docs`.

## API

All endpoints (except `/` and `/auth/login`) require a valid `Authorization: Bearer <token>` header.

### `POST /auth/login`
Authenticate with the seeded (or self-managed) user credentials to obtain a JWT access token. Example body:

```json
{
  "email": "franco@pandektes.com",
  "password": "should_hire_me"
}
```

Example response:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "a3f538f1-3f0f-4a31-9a27-7f9fa0dfc2a5",
    "email": "franco@pandektes.com"
  }
}
```

### `GET /docs`
Swagger UI for exploring the API. Use the **Authorize** button to paste the JWT and issue authenticated requests directly from the browser.

### `POST /cases/import`
Multipart form-data upload (requires the bearer token) that expects a `file` field containing either the HTML or PDF case file. On success it returns the stored resource.

Sample response body:
```json
{
  "id": "b2f4a6ce-1c19-4eb3-9d4e-80cf98cb2448",
  "title": "Example v. Example",
  "decisionType": "Judgment",
  "decisionDate": "2024-01-15T00:00:00.000Z",
  "office": "Example Board",
  "court": "Court of Justice of the European Union",
  "caseNumber": "C-123/24",
  "summary": "…",
  "conclusion": "…",
  "createdAt": "2025-01-20T12:00:00.000Z",
  "updatedAt": "2025-01-20T12:00:00.000Z"
}
```

If a case with the same `caseNumber` already exists it will be updated; otherwise it is created.

### `GET /cases/{id}`
Fetches a single case resource by its UUID (requires bearer token).

### `DELETE /cases/{id}`
Deletes a single case resource by its UUID (requires bearer token).

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Connection string for Prisma (PostgreSQL). |
| `OPENAI_API_KEY` | ✅ | API key for the OpenAI-compatible provider. |
| `CORS_ORIGINS` | ❌ | Comma-separated list of allowed origins for CORS. Defaults to allow all origins. |
| `OPENAI_MODEL` | ❌ | Override for the model name (defaults to `gpt-4o-mini`). [OpenAI Models](https://platform.openai.com/docs/models) - Must have structured outputs |
| `JWT_SECRET` | ✅ | Secret used to sign JWT access tokens. |
| `JWT_ACCESS_TOKEN_TTL` | ❌ | Lifetime in seconds for issued access tokens. Defaults to `3600`. |
| `SEED_USER_EMAIL` | ✅ (for seeding) | Email for the demo user created by `pnpm db:seed`. |
| `SEED_USER_PASSWORD` | ✅ (for seeding) | Password for the demo user created by `pnpm db:seed`. |
| `SEED_USER_SALT_ROUNDS` | ❌ | bcrypt salt rounds used during seeding (defaults to `12`). |

## Key Decisions & Trade-offs

- **OpenAI Responses API**: Chosen for native JSON mode, simplifying schema validation. This can be swapped with any compatible provider by adjusting `ExtractionService`.
- **LLM-first parsing**: HTML/PDF parsing is intentionally minimal. The cleaning is done before handing control to the LLM to keep the implementation flexible. Deterministic parsing could be added later for frequently seen formats.
- **Upsert by `caseNumber`**: Helps avoid duplicates when re-processing previously ingested documents. Cases without a number are treated as unique inserts.

## Production Hardening Ideas

1. Automated retries and rate-limit handling for LLM providers.
2. Persist the original file and/or structured JSON blob for traceability.
3. Add structured validations + business rules (e.g. enforce required fields based on decision type).
4. Implement background jobs for extraction so uploads return quickly.
5. Test coverage (unit tests for extraction pipeline, e2e tests hitting a mock LLM).

## Troubleshooting

- **`prisma generate` missing**: Ensure `pnpm exec prisma generate` has been run after installing dependencies.
- **LLM failures**: Confirm the API key has access to JSON mode and that the document text is within size limits (service truncates to ~15k characters per request but can be updated by adjusting `RAW_TEXT_MAX_LENGTH`).
- **Docker port conflicts**: Update the exposed port in `docker-compose.yml` and `DATABASE_URL` accordingly.

Feel free to reach out if you have questions or run into issues while testing the servicea or have suggestions for improvement. @francogiuntoli on GitHub.
