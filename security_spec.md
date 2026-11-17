# BalaMind Security Specification & Dirty Dozen Audit

## 1. Data Invariants
1. A `UserProgress` document at `/users/{userId}` can only be read (`get`) or written (`create`, `update`) by the authenticated owner whose `request.auth.uid == userId` and whose email is verified (`request.auth.token.email_verified == true`).
2. `list` queries on `/users` are strictly forbidden to prevent user enumeration (`allow list: if false;`).
3. `delete` on `/users/{userId}` is disabled from client SDKs (`allow delete: if false;`) to prevent accidental progress loss.
4. No PII fields (`email`, `phone`, `address`) are stored inside `/users/{userId}`.
5. `uid` is immutable after creation (`incoming().uid == existing().uid`) and must match `request.auth.uid` and the path `{userId}`.
6. `createdAt` is immutable (`incoming().createdAt == existing().createdAt`) and must equal `request.time` on creation; `updatedAt` must equal `request.time` on both creation and update.
7. `levels` and `scores` maps must contain only the exact 9 allowlisted game keys (`memory`, `numberSlide`, `colorSort`, `maze`, `simon`, `connectDots`, `mathGrid`, `tangram`, `oddOneOut`), each bounded to valid integer ranges (`levels[k] >= 1 && levels[k] <= 1001`, `scores[k] >= 0 && scores[k] <= 1000000`).
8. `language` must be one of `'kk' | 'ru' | 'en'`.

## 2. Dirty Dozen Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated read/write**: `auth = null` attempting `get(/users/u1)` or `create(/users/u1)`.
2. **Cross-user read**: User `u2` attempting `get(/users/u1)`.
3. **Collection scraping (`list`)**: Authenticated user `u1` attempting `list(/users)`.
4. **UID Spoofing on Create**: User `u1` creating `/users/u1` with `{ uid: 'u2', ... }`.
5. **Path ID Poisoning**: User `u1` targeting `/users/../../admin` or `/users/` with >128 chars.
6. **Shadow / Ghost Field Injection**: User `u1` creating or updating `/users/u1` with `{ isAdmin: true }` or `{ role: 'superadmin' }`.
7. **Unverified Email Bypass**: Authenticated user with `email_verified: false` attempting `create` or `update`.
8. **Immutable Field Tampering**: User `u1` updating `uid` or `createdAt` on `/users/u1`.
9. **Client Timestamp Forgery**: User `u1` sending a hardcoded past/future timestamp for `createdAt` or `updatedAt` instead of `request.time`.
10. **Game Map Poisoning (Extra Keys)**: User `u1` adding an arbitrary key `hack: 999` inside `levels` or `scores`.
11. **Out-of-Bounds Level / Score Overflow**: User `u1` setting `levels.memory = 999999` or `totalScore = -50`.
12. **DisplayName Buffer / Type Poisoning**: User `u1` setting `displayName` to a 5000-char string or non-string type.
