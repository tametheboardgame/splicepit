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

`yard-bright-base-v2.part00.txt` through `yard-bright-base-v2.part11.txt` are ordered base64 chunks of that exact recovered WebP. They are source transport, not browser-loaded runtime assets.

`scripts/materialize-ysp3-yard.mjs` joins the chunks and refuses to emit the runtime pack unless all of the following match the recovered approved asset:

- exact 177,808-byte length;
- exact SHA-256;
- complete RIFF payload length;
- complete VP8 chunk length;
- valid VP8 key-frame marker;
- exact 1280 × 720 dimensions.

The generated foreground is currently a fully transparent, exactly aligned 1280 × 720 staging layer. YSP-6 owns authored foreground/occlusion extraction so that depth pixels are moved only once the collision and interaction geometry from YSP-4/YSP-5 is known.

The previous seven-part `yard-bright-base.partXX.txt` transport was incomplete and is obsolete. Temporary recovery fragments and the discarded q20 experiment are not production sources.
