# Runbook

## Local Test

```bash
npm test
npm run build
```

## Cloudflare Pages Prep

The project is configured for Cloudflare Pages as `southpaw-scales`.

Required Cloudflare token permissions:

- Cloudflare Pages: Edit
- Account access for `Andy@denley.nz's Account`
- DNS edit for `denley.nz` if the deploy process will also manage the custom-domain DNS record

Manual deploy:

```bash
npm run deploy:cloudflare
```

The manual GitHub Actions deploy requires these GitHub repository secrets:

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
docker build -t git.denley.nz/oldn3rd/guitar-scale-generator:0.1.5 .
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
