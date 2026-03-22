# Contributing to Parbin

Thank you for helping improve Parbin. This document describes how we expect contributions to be prepared and reviewed.

## Before you start

1. **Open or find an issue** describing the bug, feature, or docs change. For small fixes (typos, obvious bugs), a short issue or a PR with a clear description is enough.
2. **Read the docs** in [`docs/`](./docs/)—especially [Architecture](./docs/architecture.md), [API](./docs/api.md), and [Frontend & styling](./docs/frontend-and-styling.md)—so your change fits existing patterns.
3. **License**: By contributing, you agree your contributions are licensed under the same terms as the project ([MIT](./LICENSE)).

## Development setup

From the repository root:

```bash
pnpm prepare:all
pnpm db:up
```

Configure `backend/.env` (see `backend/.env.example`) and optionally `frontend/.env` from `frontend/.env.example`. Run the stack:

```bash
pnpm dev:all
```

More detail: [README.md](./README.md).

## Fork and branch naming

1. **Fork** this repository on GitHub and push your changes from **a branch on your fork** 
2. **Open pull requests** from that branch into this upstream repository.

**Branch name format:** `scope/descriptive-summary`

Use a short, kebab-case slug after the scope (for example, `fix/login-redirect-loop`, `docs/contributing-branch-names`). Pick **scope** from the list below so it matches the kind of issue you are addressing.

| Scope | Use when |
| ----- | -------- |
| `feature` | Adding new functionality tracked as a **FEAT** issue labeled **`Roadmap`**. |
| `task` | Improvements that are not a roadmap-level goal: UX, optimization, tests, or development/build/deployment changes. May also be a **FEAT** issue **without** the **`Roadmap`** label. |
| `fix` | Fixing a bug described by a **BUG** issue. |
| `docs` | Documentation-only changes. |
| `sec` | Security-related changes (see also [SECURITY.md](./SECURITY.md) for sensitive reports). |

## Pull request checklist

Use this template in your PR description (copy and fill in):

```markdown
## Related issue

Closes #123
<!-- or: Related to #456 (partial) -->

## Summary

- What changed and why (user- or maintainer-facing impact).


```

### What we look for

- **Scope**: Prefer focused PRs over large mixed refactors.
- **Consistency**: Match naming, structure, and tooling already in the repo.
- **Documentation**: API, environment, or behavioral changes should update `README.md` and, when relevant, `docs/api.md` (see also [Agents](./docs/agents.md) for automation-friendly notes).

## Code style

- **Frontend**: ESLint + Prettier (`pnpm --dir frontend lint`, `pnpm format:frontend`).
- **Backend**: Standard Go formatting (`gofmt` / your editor’s Go format).
- Root Prettier config: `.prettierrc`.

## Questions

If something is unclear, ask in the issue or PR. For security-sensitive reports, use [SECURITY.md](./SECURITY.md) instead of a public issue.
