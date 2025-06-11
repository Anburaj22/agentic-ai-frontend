FROM public.ecr.aws/docker/library/node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM public.ecr.aws/docker/library/node:20-slim

RUN apt-get update && \
    apt-get install -y libvips-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3030

CMD ["npx", "next", "start", "-p", "3030"]
