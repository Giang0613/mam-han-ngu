FROM node:24-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM python:3.13-slim-bookworm AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libstdc++6 libatomic1 libsndfile1 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 learner
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY scripts/mandarin-runtime-requirements.txt scripts/mandarin-requirements-lock.txt /tmp/voice/
RUN python -m venv /opt/mandarin \
    && /opt/mandarin/bin/python -m pip install --no-cache-dir -r /tmp/voice/mandarin-runtime-requirements.txt
COPY --from=builder --chown=learner:learner /app/node_modules ./node_modules
COPY --from=builder --chown=learner:learner /app/.next-production ./.next-production
COPY --from=builder --chown=learner:learner /app/public ./public
COPY --from=builder --chown=learner:learner /app/data ./data
COPY --from=builder --chown=learner:learner /app/scripts ./scripts
COPY --from=builder --chown=learner:learner /app/package.json /app/next.config.ts ./
RUN mkdir -p /app/storage && chown learner:learner /app/storage
ENV NODE_ENV=production \
    SUPERWEB_DIST_DIR=.next-production \
    STUDY_DATABASE_PATH=/app/storage/local.db \
    STUDY_BACKUP_DIR=/app/storage/backups \
    SUPERWEB_AUDIO_ROOT=/app/storage/mandarin-audio \
    SUPERWEB_AUDIO_PYTHON=/opt/mandarin/bin/python
USER learner
EXPOSE 3000
VOLUME ["/app/storage"]
CMD ["node","scripts/container-start.mjs"]
