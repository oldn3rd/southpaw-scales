# Architecture

## Runtime

The app is a static React/Vite single-page app served by nginx on port `8080`.

## Music Model

`src/music.ts` owns the music theory logic:

- chromatic notes are normalized to sharp spellings
- modes are defined by semitone intervals from the selected root
- relative mode rows are derived from the selected mode's parent major key
- fretboard notes are generated from standard tuning through fret 12
- left-handed rendering mirrors fret order while keeping the same generated notes

## Deployment

Kubernetes manifests live in `deploy/kubernetes` and use:

- namespace `guitar`
- deployment `guitar-scale-generator`
- service on port `80`
- nginx ingress for `guitar.denley.nz`
- `letsencrypt-cloudflare` as the cluster certificate issuer

The app is stateless and does not require persistent storage.
