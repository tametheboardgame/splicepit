# YSP-3 Bright Yard source

The files in this directory are the lossless repository transport for the selected YSP-2 Bright Yard production candidate.

Source of truth:

- generation ID: `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`
- selected direction: **open-centre Yard**
- production canvas: **1280 × 720**
- runtime format: WebP

`yard-bright-base.part00.txt` through `yard-bright-base.part06.txt` are ordered base64 chunks of the same WebP image. They are intentionally source material rather than runtime assets.

`scripts/materialize-ysp3-yard.mjs` validates the RIFF/WebP header, validates the exact 1280 × 720 dimensions, joins the chunks and writes the runtime assets under `public/generated/ysp3/` for development and production builds.

The generated foreground is currently a fully transparent, exactly aligned 1280 × 720 staging layer. YSP-6 owns authored foreground/occlusion extraction so that depth pixels are moved only once the collision and interaction geometry from YSP-4/YSP-5 is known.

The discarded q20 compression experiment is not part of the production pack.
