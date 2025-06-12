# ---- Builder Stage ----
FROM public.ecr.aws/docker/library/node:20 AS builder

# Install dependencies for native modules like sharp
RUN apt-get update && \
    apt-get install -y python3 make g++ libvips-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install all dependencies including sharp with native bindings
RUN npm install --legacy-peer-deps --include=optional

COPY . .

# Build your Next.js app
RUN npm run build

# ---- Runtime Stage ----
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3030

CMD ["npx", "next", "start", "-p", "3030"]
