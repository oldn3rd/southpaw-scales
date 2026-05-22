# Guitar Scale Generator

Colourful web app for exploring guitar scales, modes, relative keys, and left-handed or right-handed fretboard views.

## Features

- Select a root key and one of the seven major-scale modes.
- Generate only the notes that belong to the selected key and mode.
- Toggle between right-handed and left-handed fretboard orientation.
- Compare related modal rows from the shared parent major key.
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

## Container

```bash
docker build -t git.denley.nz/oldn3rd/guitar-scale-generator:0.1.4 .
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

If the intended hostname really is `guitar.dinly.nz`, update `deploy/kubernetes/ingress.yaml` and create the equivalent record in the `dinly.nz` zone.
