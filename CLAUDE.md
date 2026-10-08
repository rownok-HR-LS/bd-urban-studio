# BD-urban Studio: notes for contributors and AI assistants

## Conventions
- **Every user-facing string goes in both languages.** Add it to `packages/core/src/i18n/en.ts` and `bn.ts`; the `Dictionary` type fails the build if `bn.ts` is missing a key. Use `t((d) => d.section.key, { vars })`. Numbers passed as vars become Bangla digits automatically. For other numbers use `localDigits` / `formatPrice`.
- **Colours come from `packages/core/src/theme.ts`.** Mobile reads them through `usePrefs().colors`; admin through Tailwind tokens (`bg-surface`, `text-primary`…) mapped to CSS variables in `apps/admin/src/index.css`. Never hard-code hex values in screens.
- **Catalog data lives in `packages/core/src/catalog`.** After changing it, run `npm run db:seed` to regenerate `supabase/seed/catalog.sql`. Pet-safety stays conservative (ASPCA non-toxic list only).
- **Money fields are never written by customers.** Prices, totals and AI output are written by edge functions with the service role; triggers in `20261008000002_security.sql` enforce this. Add a check to `tools/db/check.mts` for any new policy.
- **Demo mode:** when no Supabase env vars are set, both apps use the seed catalog. Keep that path working; it's how previews and leadership demos run.

## Expo
Expo SDK 57. APIs change between SDKs, so check https://docs.expo.dev/versions/v57.0.0/ before using an Expo API from memory. Install native packages with `npx expo install` inside `apps/mobile`.

On web, children of `<Link asChild>` must receive a single flattened style object (`StyleSheet.flatten`), not an array or a function.

## Git
Commit as `Rownok Rahman <302190444+rownok-HR-LS@users.noreply.github.com>`. The repo is public, so keep work emails and secrets out of history.
