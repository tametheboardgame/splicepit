# YSP-3 Bright Yard source

This directory contains the deterministic repository transport for the user-approved Bright Yard master recovered on 30 August 2026.

Source of truth:

- original selected generation lineage: `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`
- selected direction: **open-centre Yard**
- recovery source: the exact approved Yard image supplied by the user after the original repository transport was found to be truncated
- recovered production canvas: **1280 × 720**
- runtime format: WebP
- exact production byte length: **177,808 bytes**
- exact SHA-256: `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`

The recovered WebP is stored as ordered base64 transport pieces. Parts `00` through `05` and `07` through `11` are normal 20,000-character chunks. Segment `06` is deliberately stored as the smaller `yard-bright-base-v2.part06a.txt` and `yard-bright-base-v2.part06b.txt` fragments because the original single-segment GitHub transfer was corrupted.

`scripts/materialize-ysp3-yard-recovered.mjs` deterministically joins the two segment-06 fragments into the transient `yard-bright-base-v2.part06.txt` expected by `scripts/materialize-ysp3-yard.mjs`. The materialiser then joins the full source and refuses to emit the runtime pack unless all of the following match the recovered approved asset:

- exact 177,808-byte length;
- exact SHA-256;
- complete RIFF payload length;
- complete VP8 chunk length;
- valid VP8 key-frame marker;
- exact 1280 × 720 dimensions.

The production build also verifies the emitted pack independently, and the browser smoke suite requires Chromium to successfully fetch and decode the WebP at 1280 × 720.

The generated foreground is currently a fully transparent, exactly aligned 1280 × 720 staging layer. YSP-6 owns authored foreground/occlusion extraction so that depth pixels are moved only once the collision and interaction geometry from YSP-4/YSP-5 is known.

The previous seven-part `yard-bright-base.partXX.txt` transport was incomplete and is obsolete. The historical q20 candidate is also truncated and is not a production source.
