FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
COPY tsconfig.json ./
RUN npx tsc
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs24-debian12

LABEL maintainer="andres@gomezalvarez.dev"
LABEL project="secure-wallet"

WORKDIR /app
COPY --from=builder --chown=65532:65532 /app/dist ./dist
COPY --from=builder --chown=65532:65532 /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 8080
USER nonroot
CMD ["dist/index.js"]
