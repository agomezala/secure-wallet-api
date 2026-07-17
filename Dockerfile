FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
COPY tsconfig.json ./
RUN npx tsc
RUN npm prune --omit=dev

FROM node:24-bookworm-slim
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

LABEL maintainer="andres@gomezalvarez.dev"
LABEL project="secure-wallet"

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 8080
USER node
CMD ["node", "dist/index.js"]
