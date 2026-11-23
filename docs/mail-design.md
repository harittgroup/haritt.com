# Haritt mail design standard

One skeleton for every mail. Only the brand colour, logo and name change.

## Skeleton (in this order)
1. Small logo + brand name (no big header image).
2. "Hi <first name>," or a plain one-line title.
3. One or two short sentences. No marketing words.
4. Optional ID/code box (accent tint).
5. Optional numbered steps (max 3).
6. One button (accent colour). Never two.
7. One small grey note line (time, expiry, privacy).
8. Footer: brand name only.

## Rules
- Plain-text version always included. Hidden preview line always set.
- No big images, no tracking links, no all-caps subjects. Subject says exactly what the mail is.
- Light and dark: classes for Apple Mail dark, safe colours for Gmail dark.
- Danger mails (expiry, failed jobs) keep the red header. They are the only exception.
- Haritt Group mails never mention Haritt Developers or HV Verse. HV Verse mails never show "Haritt" except the footer "A Haritt venture".

## Brand tokens
| Brand | Accent | Tint | Dark accent |
|---|---|---|---|
| Haritt Group | #A70D22 | #FBEDEF | #E88A93 |
| Haritt Developers | #E8461F | #FDEEE8 | #F29A7C |
| HV Verse | own app colour | own tint | own |

Reference implementation: `card()`, `steps()`, `idbox()` in `workers/haritt-inbox.js`. Preview: /admin/inbox/sequence/
