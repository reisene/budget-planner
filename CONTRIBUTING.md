# Contributing to Budget Planner

Thanks for your interest in contributing! Please read our
[Code of Conduct](CODE_OF_CONDUCT.md) first.

## Getting started

Requirements: Node.js 26.x (see `.nvmrc`) and npm.

```bash
git clone https://github.com/reisene/budget-planner.git
cd budget-planner
npm ci
npm run dev
```

## Workflow

1. Open an issue (or comment on an existing one) before starting larger work.
2. Fork the repository and create a branch from `develop`.
3. Make your changes, adding or updating tests where relevant.
4. Make sure all checks pass:

   ```bash
   npm run lint
   npm run typecheck
   npm run format:check
   npm test
   npm run build
   ```

5. Open a pull request against `develop` and fill in the template.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
(enforced by commitlint via a Husky hook), for example:

```
feat(budget): add monthly category summary
fix(ui): correct rounding in totals
```

## Code style

Formatting is handled by Prettier and linting by ESLint. Staged files are
formatted automatically on commit (lint-staged).

## Licensing

By contributing, you agree that your contributions are licensed under the
[AGPL-3.0-or-later](LICENSE).

## Security

Do not report vulnerabilities in public issues. See [SECURITY.md](SECURITY.md).
