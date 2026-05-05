## Orin Theme

Minimal Solid + Tailwind runtime theme scaffold for `apps/themes/orin`.

### Usage

1. Run `bun dev` to start the theme locally.
2. Add new page files directly under `src/pages`.
3. Extend `src/routers/routes.ts` while keeping the existing public and protected route guard pattern.

### Scripts

```bash
bun dev
bun run check-types
bun run build
```

### Notes

- `site.config.ts` is intentionally small. Keep only the values needed by `vite.config.ts` and deploy.
- Pages use flat file names under `src/pages`, not nested `index.tsx` page folders.
- The scaffold is intentionally empty aside from the routing shell and one placeholder page.
