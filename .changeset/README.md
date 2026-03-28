# Changesets

This folder controls package versioning and changelog generation for publishable packages.

## Create a changeset

```bash
pnpm changeset
```

## Version packages

```bash
pnpm version-packages
```

## Publish packages

```bash
pnpm release
```

In CI, publishing is handled by `.github/workflows/release.yml` via Changesets.
