# Stage 1: Build stage
FROM public.ecr.aws/docker/library/node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Production stage
FROM public.ecr.aws/docker/library/node:18-alpine

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3030

CMD ["npx", "next", "start", "-p", "3030"]


