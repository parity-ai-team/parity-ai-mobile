# PARITY AI GitHub Collaboration Rules

This document defines the shared GitHub workflow for every PARITY AI repository.

## 1. Protected default branch

- Use `main` as the default branch.
- Do not push directly to `main`.
- Merge changes through a pull request.
- Block force pushes and branch deletion on `main`.

## 2. Branch names

Create one short-lived branch per change.

- `feat/<issue>-<summary>` for features
- `fix/<issue>-<summary>` for bug fixes
- `docs/<issue>-<summary>` for documentation
- `chore/<issue>-<summary>` for maintenance
- `test/<issue>-<summary>` for test-only changes

Use lowercase English words separated by hyphens. Delete the branch after merge.

## 3. Commits

Use Conventional Commit prefixes.

- `feat:` new behavior
- `fix:` defect correction
- `docs:` documentation only
- `test:` tests only
- `refactor:` behavior-preserving code changes
- `chore:` tooling, dependencies, or repository maintenance

Keep each commit focused and never commit secrets, personal data, real financial data, generated builds, or local environment files.

## 4. Pull requests

- Send every tracked-file change through a pull request instead of updating `main` directly.
- Keep one purpose per pull request.
- Keep the pull-request body compact with only two top-level sections: `변경사항` and `검증`.
- Put the reason, related issue, screenshots, or API examples under `변경사항` only when relevant.
- Put commands run, manual checks, results, and anything not run under `검증`.
- Use squash merge and delete the merged branch.

Draft pull requests may be used for unfinished work.

## 5. Required quality checks

Run the checks that apply to the repository before opening or merging a pull request:

- formatting and linting
- static type checking
- unit and contract tests
- application build
- secret and dependency checks

Required CI checks must pass before merge. Do not bypass a failing check by weakening or deleting the test without explaining the product decision.

## 6. Frontend and backend contract changes

- Treat the backend OpenAPI specification as the API source of truth.
- Make additive, backward-compatible changes whenever possible.
- Coordinate frontend and backend changes with linked issues and pull requests.
- For a breaking change, add the replacement first, migrate consumers, and remove the old field afterward.
- Change `api`, `model`, `rules`, or `data` versions when their documented meaning changes.
- Do not maintain handwritten duplicate API DTOs in the mobile repository when generated types are available.

## 7. Data and security

- Use synthetic data only in the public codebase and test fixtures.
- Never commit tokens, credentials, account numbers, transaction originals, pregnancy details, or other identifying data.
- Keep local `.env` files untracked and document required keys in `.env.example`.
- Do not send raw financial or pregnancy data to an external LLM.
- Report a suspected secret or personal-data leak immediately and rotate or remove the exposed value before continuing normal development.

## 8. Repository hygiene

- Keep README setup instructions current.
- Do not commit generated build output, dependency folders, editor state, caches, or local databases.
- Store large demo media outside Git history or use Git LFS only after team agreement.
- Record important cross-team technical decisions in a decision document instead of leaving them only in chat or pull-request comments.
