# Architecture

## Product

Southpaw Scales is a static guitar theory and practice app served at `guitar.denley.nz`.

## Runtime

The app is a static React/Vite single-page app served by nginx on port `8080`.

## Music Model

`src/music.ts` owns the music theory logic:

- chromatic notes are normalized to sharp spellings
- modes are defined by semitone intervals from the selected root
- relative mode rows are derived from the selected mode's parent major key
- fretboard notes are generated from standard tuning through fret 12
- left-handed rendering mirrors fret order while keeping the same generated notes
- 12-bar blues practice rows are generated from key-aware I7, IV7, and V7 dominant chords

## Deployment

### Cloudflare Pages

The public static-hosting target is Cloudflare Pages:

- project name: `southpaw-scales`
- build command: `npm run build`
- output directory: `dist`
- custom hostname: `guitar.denley.nz`

Manual deployment is prepared through `npm run deploy:cloudflare`. The manual GitHub Actions workflow in `.github/workflows/cloudflare-pages.yml` creates the Pages project if needed and deploys `dist`. It requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

The GitHub deploy token is deliberately limited to `Pages Write`. DNS-01 certificate automation uses a separate Cloudflare token with `Zone Read` and `DNS Write` for `denley.nz`, stored only in Kubernetes as `cert-manager/cloudflare-api-token-secret`.

### Kubernetes

Kubernetes manifests live in `deploy/kubernetes` and use:

- namespace `guitar`
- deployment `guitar-scale-generator`
- service on port `80`
- nginx ingress for `guitar.denley.nz`
- `letsencrypt-cloudflare` as the cluster certificate issuer
- node placement on `kccontrol` for the initial locally imported image path

The app is stateless and does not require persistent storage.
