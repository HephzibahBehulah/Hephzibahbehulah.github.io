FROM node:24-trixie-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git procps python3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=docker.io/cloudflare/sandbox:1.0.3 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim

WORKDIR /workspace
CMD ["sleep", "infinity"]
