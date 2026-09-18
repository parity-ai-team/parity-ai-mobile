# Repository Agent Instructions

These instructions apply to every automated coding agent working in this repository.

## Pull-request workflow

- Never commit, push, or merge a tracked-file change directly to `main` as the normal workflow.
- Create a short-lived branch and deliver the change through a pull request.
- Use the repository pull-request template without adding more top-level sections. Keep only `변경사항` and `검증`.
- Before any attempt to skip the pull-request workflow, explicitly remind the user that this repository requires a pull request.
- If the user asks to commit, push, or merge directly to `main`, pause and ask for explicit confirmation after explaining that it bypasses the repository rule.
- A read-only investigation, planning-only task, or response with no tracked-file changes does not require a pull request.
- Do not claim that a pull request exists until its GitHub URL has been verified.

## Change discipline

- Keep one purpose per branch and pull request.
- Do not modify unrelated user changes.
- Update README or decision records when setup, behavior, contracts, or operational assumptions change.
- Record commands run and their outcomes under `검증`. State clearly when a relevant check was not run.
- Do not weaken, delete, or regenerate a test expectation merely to make a change pass.

## Frontend and backend coordination

- Treat the backend OpenAPI specification as the API source of truth.
- Coordinate frontend-visible contract changes with the backend repository and link the related pull requests.
- Prefer generated API types over handwritten duplicate DTOs.
- Keep changes backward compatible when possible. For breaking changes, add the replacement, migrate consumers, and then remove the old contract.

## Data and security

- Use synthetic data only in source, fixtures, logs, screenshots, and examples.
- Never commit credentials, tokens, local environment files, account identifiers, real transaction data, or detailed pregnancy information.
- Never put secrets in `EXPO_PUBLIC_` variables because those values are bundled into the client.
- Do not send raw financial or pregnancy data to an external LLM.
