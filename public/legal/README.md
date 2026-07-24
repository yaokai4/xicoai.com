# 营业执照 / Business license image

Drop the company's electronic business licence (电子营业执照) image into **this
folder** so the website can show it. The footer and the About page will then
render a **营业执照 / View business license** link automatically — until the file
exists, that link is hidden (never a broken 404) and only the unified social
credit code (linked to gsxt.gov.cn for verification) is shown.

## How

1. Save the licence image as one of these exact names (first match wins):
   - `business-license.png`  ← preferred
   - `business-license.jpg`
   - `business-license.jpeg`
   - `business-license.webp`
2. Put it in `public/legal/` (this directory).
3. Redeploy / rebuild. The link appears on every page footer and on `/about`.

## Notes

- The detection logic lives in `src/lib/legal.ts`.
- The registration facts shown next to it (credit code, legal rep, registered
  address, founding date) come from `src/lib/site.ts` → `registration`.
- Recommended: export the licence at a readable resolution (long edge ≥ 1600px)
  and keep the file under ~1 MB.
