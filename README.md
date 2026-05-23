# Southpaw Scales

Colourful web app for exploring guitar scales, modes, chords, blues practice loops, and left-handed or right-handed fretboard views.

## Features

- Select a root key and one of the seven major-scale modes.
- Generate only the notes that belong to the selected key and mode.
- Toggle between right-handed and left-handed fretboard orientation.
- Compare related modal rows from the shared parent major key.
- Practice a slow key-aware 12-bar blues loop with I7, IV7, V7 chord playback, and a click track.
- Deploy as a static Cloudflare Pages site or as an nginx container in Kubernetes.
- Container-ready static web app for Kubernetes ingress at `guitar.denley.nz`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Verification

```bash
npm test
npm run build
```

## Cloudflare Pages

The app is static and can be hosted on Cloudflare Pages at `guitar.denley.nz`.

Manual deploy, using a Cloudflare token with Pages edit access only:

```bash
npm run deploy:cloudflare
```

GitHub Actions is configured as a manual workflow in `.github/workflows/cloudflare-pages.yml`. It creates the `southpaw-scales` Pages project if needed, then deploys `dist`.

The workflow uses these GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The current Cloudflare account ID is `00a81954913ed3315c60cec2bc57a8b8`.

Security note: the GitHub deploy token is intentionally `Pages Write` only. DNS and certificate automation use a separate Kubernetes-only token named `cert-manager DNS-01 denley.nz`, scoped to `Zone Read` and `DNS Write` for `denley.nz`.

## Container

```bash
docker build -t git.denley.nz/oldn3rd/guitar-scale-generator:0.1.6 .
```

Push that image to the registry your cluster can pull from, then deploy:

```bash
./scripts/deploy-kubernetes.sh
./scripts/deploy-kubernetes.sh --commit
```

The default run renders the manifests locally so it is safe without a live cluster context.

## DNS

The Kubernetes ingress uses the standard `nginx` ingress service, currently reached through `10.7.3.202`.

Create this record in the authoritative `denley.nz` zone:

```text
guitar.denley.nz. 3600 IN A 10.7.3.202
```

For Cloudflare Pages, replace the current public `A` record with the custom-domain record Cloudflare creates for the Pages project.
