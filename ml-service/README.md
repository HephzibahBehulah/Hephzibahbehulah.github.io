# Hephzibah ML Service

External Python compute boundary for dataset profiling and machine-learning jobs. This service is intentionally not served by the static Cloudflare Worker.

## Endpoints

- GET `/health`
- POST `/profile` with CSV or JSON upload
- POST `/train` with a dataset plus `task` and `target`

Supported tasks:

- classification
- regression
- clustering
- anomaly detection

The service performs validation, type detection, missing-value handling, preprocessing, baseline model comparison and evaluation. It never executes uploaded Python, shell commands or arbitrary files.

## Run

```
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

For production, put this service behind authentication and a job queue. Do not expose an unauthenticated training endpoint to the public internet.
