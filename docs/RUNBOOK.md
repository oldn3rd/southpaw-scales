# Runbook

## Local Test

```bash
npm test
npm run build
```

## Build Image

```bash
docker build -t git.denley.nz/oldn3rd/guitar-scale-generator:0.1.0 .
```

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
