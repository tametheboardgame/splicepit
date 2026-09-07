# SplicePit Binary Asset Delivery Policy

Status: **LOCKED**

This file defines the default working rule for generated images, approved visual masters and other non-text production assets used by SplicePit.

## Core rule

Use **one asset, one transfer, one verification, one commit/checkpoint**.

Do not attempt large multi-asset assembly jobs or long-running fragment reconstruction when a finished binary asset can be transferred directly.

## Default asset workflow

For each approved asset:

1. Identify the authoritative source before changing anything.
   - Preserve the approved generation/file identity where known.
   - Record dimensions, format, byte size and SHA-256 when available.
   - Do not silently regenerate, repaint, crop or substitute already-approved artwork.

2. Produce the required production derivative as one bounded operation.
   - Work on one asset at a time.
   - Finish the actual PNG/JPEG/WebP/audio/etc. before attempting repository integration.

3. Verify the local production asset.
   - Check format and dimensions.
   - Check byte size where a contract exists.
   - Calculate and record SHA-256 for locked assets.

4. Transfer the finished binary using the most direct supported binary mechanism.
   - Prefer a native Git/GitHub blob, repository file upload or other direct binary/file transport.
   - Do not commit dozens or hundreds of Base64 fragment files as the normal delivery mechanism.
   - Do not use a giant chat-generated Base64 payload merely to work around a missing binary source.

5. Verify the repository copy independently after transfer.
   - Confirm the committed blob/file exists at the intended path.
   - Re-check dimensions, size and hash where applicable.
   - Treat any mismatch as a failed transfer, not as acceptable drift.

6. Run the asset-specific build/test/smoke checks.

7. Commit/checkpoint the completed asset before starting the next asset.

## Fragmentation fallback

Fragmented transfer is an emergency fallback only, not a standard workflow.

If fragmentation is genuinely unavoidable:

- keep the operation to one asset only;
- use small, bounded chunks with an explicit ordered manifest;
- verify each chunk immediately after writing it;
- reconstruct and hash-check the final binary as soon as all chunks are present;
- remove temporary transport fragments from the production design unless they are explicitly required at runtime;
- never continue blindly after truncation, missing chunks or repeated connector failures.

If the same transfer/assembly method fails more than once, stop using that method and switch transport strategy rather than repeatedly retrying a larger version of the same operation.

## Approved-art recovery rule

When an already-approved image cannot be transferred cleanly:

- preserve the approval as authoritative;
- recover or re-supply the exact approved source where possible;
- do not regenerate a visually similar replacement merely to make CI green;
- separate source recovery from production conversion and repository integration;
- once recovered, return to the default one-asset workflow above.

## Batch-size rule

Visual-production work should be deliberately checkpointed:

`one asset -> verify -> integrate -> verify -> commit -> next asset`

A work package may contain many assets, but repository integration should proceed in small independently recoverable units. Avoid operations where one failure invalidates or obscures several completed assets.

## Why this rule exists

The previous LPSP-3 Bramble Pit integration repeatedly stalled while attempting to reconstruct an approved image from incomplete Base64 fragments. The design and validation contract were sound; the transport mechanism was the failure point.

Future work must optimise for recoverability, deterministic verification and short bounded operations rather than maximising the amount of binary data moved in one step.

Locked by user instruction on 7 September 2026.
