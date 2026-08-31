# YSP-8 Dark Yard source

The canonical YSP-8 authored Dark Yard is reconstructed only from the text fragments in `safe/` by `scripts/materialize-ysp8-yard.mjs`.

Locked production identity:
- 1280×720 WebP
- 143,796 bytes
- SHA-256 `f1b47165fa50ffa5c45ac0f65dfa2b70bdd43b9f7c034b35c84a4359ccfbeb8b`

The materialiser validates encoded length, decoded byte length, SHA-256, RIFF/VP8 completeness and dimensions before output. The production build independently revalidates the emitted asset, and the browser smoke suite requires Chromium `Image.decode()` to succeed.

Do not add alternate or temporary Dark Yard transports beside `safe/`.
