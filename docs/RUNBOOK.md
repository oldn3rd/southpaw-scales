# Runbook

## Local Test

```bash
npm test
npm run build
```

## Cloudflare Pages Prep

The project is configured for Cloudflare Pages as `southpaw-scales`.

Required Cloudflare token permissions:

- Pages deploy token: `Pages Write` only, account-owned, stored as the GitHub repository secret `CLOUDFLARE_API_TOKEN`
- Account ID: stored as the GitHub repository secret `CLOUDFLARE_ACCOUNT_ID`

Do not give the Pages deploy token DNS permissions. DNS and certificate automation use a separate Kubernetes-only token named `cert-manager DNS-01 denley.nz` with:

- `Zone Read` for `denley.nz`
- `DNS Write` for `denley.nz`

That DNS token is stored in the cluster as `cert-manager/cloudflare-api-token-secret` and should not be copied into GitHub.

Manual deploy:

```bash
npm run deploy:cloudflare
```

The manual GitHub Actions deploy workflow is in `.github/workflows/cloudflare-pages.yml`. It creates the `southpaw-scales` Pages project if needed and then deploys the built `dist` directory.

It requires these GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The account ID is:

```text
00a81954913ed3315c60cec2bc57a8b8
```

After the Pages project exists, attach `guitar.denley.nz` as a custom domain in Cloudflare and replace the current public `A` record if Cloudflare does not do it automatically.

## Build Image

```bash
docker build -t git.denley.nz/oldn3rd/guitar-scale-generator:0.1.6 .
```

For the current homelab deployment, the image is built on `kccontrol` and imported into k3s containerd there. The deployment is pinned to `kccontrol` until registry-based image pulls are configured.

## Deploy To Kubernetes

Dry-run:

```bash
./scripts/deploy-kubernetes.sh
```

This dry-run renders the manifests locally and does not require the current kube context to be reachable.

Apply:

```bash
./scripts/deploy-kubernetes.sh --commit
```

## DNS Record

Add or verify:

```text
guitar.denley.nz. 3600 IN A 10.7.3.202
```

## Post-Deploy Checks

```bash
kubectl -n guitar get pods,svc,ingress
kubectl -n guitar rollout status deploy/guitar-scale-generator
curl -I https://guitar.denley.nz
```
