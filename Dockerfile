# Stage 1: Build stage
FROM public.ecr.aws/docker/library/node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Force rebuild of sharp for current Node version and platform
RUN npm rebuild sharp

COPY . .
RUN npm run build

# Stage 2: Production stage (non-Alpine to support sharp)
FROM public.ecr.aws/docker/library/node:22-slim

RUN apt-get update && \
    apt-get install -y \
        libvips-dev \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3030

CMD ["npx", "next", "start", "-p", "3030"]
