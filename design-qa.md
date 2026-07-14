# Design QA

source visual truth paths:

- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-d4f5a3b5-17ba-477a-bda2-0ad5f1341acc.png` — the closing section was too sparse and visually flat.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-e0db6914-48b9-4f24-8ed3-2a9adcb6f949.png` — the hero showed only a content crop instead of the complete product window.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-92f56f5e-bc2d-4b30-ab9a-da8776a0e5dc.png` — the four-link capability strip duplicated the interactive switcher below it.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-df171fe6-957e-4f0f-9a67-06384645668c.png` — the floating app identity card competed with and covered the hero product image.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-ac1fe29a-8102-4384-9a9a-89cfcb3a349f.png` — the first implementation duplicated the header identity, forced the headline into an awkward third line, and placed the overall composition too close to the page edges.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-edab92c7-ea10-465f-a62d-a513792e48b8.png` — the corrected two-line headline and narrower page measure were visibly better, but the desktop product window still entered the headline's right edge.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-3fdb5994-9eca-4497-aed1-82a0168a56c7.png` — reducing the image alone exposed the structural issue: the absolutely positioned product window still sat beneath the supporting copy at the current desktop viewport.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-4e57e808-a1e3-4747-9f0a-b2ae6d46112e.png` — the separate downloader/server/settings carousel intentionally extended beyond the viewport, but read as broken overflow and duplicated the stronger feature-switcher pattern.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-ca817ce9-620d-4c6a-aa85-bad9f8cf8905.png` — the user selected the existing interactive chapter switcher as the single preferred pattern for these product capabilities.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-17cb33f3-73ab-4ae9-8c45-5c8bcd7eead0.png` — the local-processing status pill sat too high inside the product window and visually covered the bottom-left product chrome.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-d835b0b9-0026-4d0e-b7b2-bc6fe118ac8c.png` — the solid-black, very heavy hero headline felt harsher and more generic than the requested Apple product-page direction.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-5d6864c7-5e4c-4dc1-93dc-18352adee89f.png` — after the first downward adjustment, the local-processing pill still overlapped the product frame by roughly half its height; the user explicitly requested that it sit completely below the artwork.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-32c3a20d-9f40-42f2-b456-d3e8a589f0c8.png` — the feature-switcher copy column was too narrow for its 4.2 rem display title, forcing “远程服务器，也在 Xico 里” into an awkward four-line composition.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-597e7b07-b58c-4c30-84e4-ba5c258bf232.png` — consecutive secondary feature cards used oversized headings and nearly identical image-heavy compositions, making the page feel dense and repetitive rather than refined.
- `/var/folders/5l/zrdn7nrj1bz2n_tp41q_w8y00000gn/T/codex-clipboard-1f2d9f43-5ef9-4cef-a7ae-3085f1780ee8.png` — a larger negative bottom offset still left the local-processing pill visually overlapping the product window, proving that offset tuning was not a robust fix.

implementation screenshot path: unavailable for this iteration. The browser connection failed during setup with `Cannot redefine property: process`; no stale screenshot was accepted as current evidence.

viewport: intended QA targets are desktop 1440 × 900, compact desktop 1280 × 720, and mobile 390 × 844 at DPR 1.

state: `/mac`, Chinese locale, light theme; complete ready-to-scan hero, interactive feature switcher, capability bento, and final download CTA.

full-view comparison evidence: blocked because a current browser-rendered implementation screenshot is unavailable.

focused comparison evidence: blocked for the same reason. The selected hero source asset was inspected independently: `public/mac/product/live/smart-scan.png` is a complete 1080 × 734 Xico application window with the sidebar and ready-to-scan dashboard.

primary interactions intended for browser verification: hero “看看能做什么” scrolls to `#experience`; the feature switcher auto-advances every 6.8 seconds while visible, pauses on hover/focus, supports direct tab selection, and crossfades copy and imagery; pricing, feature, purchase, and download CTAs link to their real destinations; reduced-motion mode disables continuous effects.

console errors checked: blocked without the browser connection. Server-side rendering returned HTTP 200, the hero asset is present, targeted ESLint passed, and the production build completed TypeScript plus all 205 generated pages.

## Findings

- [P1] Current browser-rendered visual comparison is unavailable.
  Location: full page, especially hero and closing capability bento.
  Evidence: runtime connection failed before capture; static and build validation are green.
  Impact: final fold placement and narrow-screen visual rhythm cannot be conclusively approved from code alone.
  Fix: capture the three target viewports in an approved browser, compare against the supplied references, and correct any remaining P0/P1/P2 drift.
- Hero composition: the large floating identity card was removed from the artwork. The app icon now sits in a compact identity lockup at the beginning of the left narrative column, preserving brand recognition without covering the product.
- Hero composition correction: the screenshot review showed that even the compact second identity was redundant beside the fixed header. It has now been removed entirely; only the restrained release-status pill remains above the narrative.
- Typography and spacing: the Chinese headline is locked to two lines at a reduced maximum size, the supporting paragraph was shortened, the left/right grid was rebalanced, and the hero plus all primary page containers now share a narrower 1280 px maximum width for more generous side margins.
- Product imagery: the hero uses the complete ready-to-scan application window rather than a content-only crop. The image is rendered at its native 1080 × 734 aspect ratio with no forced crop.
- Information architecture: the redundant four-link capability strip was removed; the richer interactive feature switcher remains the single chapter-navigation pattern.
- Closing hierarchy: the sparse centered text section was replaced by a dark/light Apple-style bento that explains the four product systems, 15-day full trial, buy-once model, and product trust proof. The final download card now closes the page.
- Accessibility: feature controls retain tablist/tab/tabpanel semantics, visible selected state, focus pause, and reduced-motion behavior.
- Responsive containment: the feature switcher now uses its three-column editorial layout only from the `xl` breakpoint upward. Compact desktop and tablet widths use a stacked layout with an internally scrollable tab row, preventing narrow text columns and page-level horizontal overflow.
- Typography: product-page display type now follows the native Apple system stack (`SF Pro` / `PingFang SC` where available), improving mixed Chinese/Latin rhythm and matching the native macOS product direction.
- Keyboard interaction: the feature tabs now implement roving focus with Arrow keys plus Home/End, while inactive tabs are removed from the sequential tab order. Automated chapter changes are not announced as unsolicited live-region updates.
- Localized layout resilience: non-Chinese hero titles use a slightly smaller fluid scale and may wrap naturally instead of forcing the second translated line to remain unbroken. This prevents long German, Spanish, French, Italian, and Russian strings from exceeding the text column on phones and compact desktops.
- Mobile navigation: the theme control now appears once inside the mobile menu instead of being duplicated in both the fixed header and menu footer, leaving the compact header with a clear logo, purchase action, and menu trigger.

## Comparison History

- Iteration 1 — Replaced the post-scan hero with a waiting-to-scan state and added a timed feature switcher with pause and reduced-motion behavior.
- Iteration 2 — Replaced the content-only waiting screen with the complete Xico application window, including sidebar and frame.
- Iteration 2 — Moved the app icon from a large floating overlay into a compact left-column product identity lockup.
- Iteration 2 — Removed the duplicate four-item quick-navigation strip.
- Iteration 2 — Replaced the sparse closing statement with a richer sales-oriented capability and ownership bento, then moved the download CTA to the true page ending.
- Iteration 2 — Static validation passed: targeted ESLint, `next build`, SSR HTTP 200, and `git diff --check`. The existing Next.js NFT warning remains unrelated to this change.
- Iteration 3 — Used the user-supplied browser screenshot as current implementation evidence. Removed the duplicate hero identity, reduced and stabilized the two-line headline, shortened the hero copy, rebalanced the grid, and narrowed the global product-page content measure from 1380–1440 px to 1280 px.
- Iteration 4 — Measured the remaining hero collision from the refreshed screenshot and reduced the desktop product window from a 700 px / 48 vw cap to a 650 px / 44 vw cap, keeping it anchored to the right column while preserving the complete uncropped product view.
- Iteration 5 — Replaced the hero's absolute, viewport-sized product artwork with a normal-flow right-column figure. Both grid columns now use `minmax(0, …)`, a fixed 64 px desktop gap, and independent width constraints, so text and imagery cannot occupy the same horizontal space. The readiness chip is now anchored inside the product frame rather than to the overall visual column.
- Iteration 6 — Folded Downloader, Server Suite, and Settings into the interactive feature switcher, expanding it from four to seven real product chapters. Reduced desktop tab height to keep all seven chapters within the switcher frame, contained mobile tabs inside their own scroll area, and removed the separate full-bleed horizontal carousel entirely.
- Iteration 7 — Moved the switcher's dense three-column layout to the 1280 px breakpoint, added complete keyboard tab behavior, and applied the Apple system type stack across the product home. Targeted ESLint, `git diff --check`, TypeScript, all 205 generated pages, and live HTTP checks for the home, features, pricing, and purchase routes pass. The local download route correctly reports unavailable because the out-of-band DMG is not mounted in this development environment.
- Iteration 8 — Audited all supported hero translations for narrow-width overflow. Removed the unbreakable translated second line, introduced a locale-safe fluid display scale, and simplified the mobile header by keeping theme selection inside the menu.
- Iteration 9 — Split the hero artwork into an overflow-visible figure and a separately clipped window surface, then lowered the local-processing pill 16 px below the product frame. The pill now reads as a deliberate floating annotation and no longer covers the app's bottom-left controls.
- Iteration 10 — Reworked the hero headline into a restrained Apple-system-color spectrum with slower fluid motion, slightly reduced display size, softer tracking, and more open line height. The gradient uses muted blue, indigo, violet, pink, warm orange, and mint rather than a neon AI-style palette; reduced-motion and forced-colors fallbacks remain intact.
- Iteration 11 — Measured every headline gradient stop against the white hero background and replaced three sub-3:1 stops with deeper Apple-system-inspired blue, indigo, violet, berry, warm orange, and teal values. Every solid stop now exceeds the WCAG 3:1 requirement for large display text while preserving the fluid spectrum.
- Iteration 12 — Extended the Apple system type stack and 1280 px page measure to all Mac product bands, the fixed header, and the footer so secondary pages no longer revert to the previous display type. Repaired every product-footer destination to use real localized routes, replaced the obsolete launched-product waitlist link with the current download action, added a matching `#download` target, and replaced the generic company mark with the real Xico app icon.
- Iteration 13 — Moved the full desktop navigation to the 1024 px breakpoint so the logo, five navigation links, locale/theme controls, and purchase button cannot collide at tablet widths. Converted the comparison and all-in-one capability tables to contained horizontal scrollers with 560 px internal minimums, preventing squeezed labels or page-level overflow on phones.
- Iteration 14 — Used the refreshed hero crop as implementation evidence and moved the local-processing pill from `-16px` to `-54px` relative to the product-window bottom. Its top edge now clears the screenshot boundary instead of covering the app's bottom chrome; the pill remains hidden on phones and fits inside the hero's reserved visual height on tablet and desktop.
- Iteration 15 — Rebalanced the feature switcher from a narrow 0.7/1.35 copy-to-image split to 0.86/1.14, reduced the active headline cap from 4.2 rem to 3.35 rem, and opened its line-height so long product names form two or three deliberate lines. Tightened the switcher height and supporting rhythm without shrinking the real product screenshot.
- Iteration 16 — Rebuilt the editorial typography scale across the page: section titles, lead-card titles, secondary-card titles, privacy statement, ownership bento, and closing CTA now step down predictably instead of competing at near-hero scale. Reduced section padding and card density, varied pearl/white card surfaces by section tone, and retained every real product image with cleaner hierarchy.
- Iteration 17 — Removed the local-processing pill from the product figure's positioned layer entirely. The product window and pill now live as separate normal-flow siblings in a vertical stack with a fixed 16 px gap, making overlap structurally impossible at every desktop and tablet width.

## Implementation Checklist

- [x] Use a complete ready-to-scan Xico product window in the hero.
- [x] Relocate the app icon so it no longer obstructs the product screenshot.
- [x] Remove the redundant capability shortcut strip.
- [x] Retain the richer interactive product switcher.
- [x] Replace the plain closing section with a premium sales and trust composition.
- [x] Preserve real product screenshots, links, localized core copy, and reduced-motion behavior.
- [x] Pass targeted lint, production build, SSR, and diff checks.
- [ ] Capture desktop, compact desktop, and mobile in a real browser.
- [ ] Run full-view and focused visual comparisons, then fix any remaining P0/P1/P2 findings.

final result: blocked
