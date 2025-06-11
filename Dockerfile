# Stage 1: Build stage
FROM public.ecr.aws/docker/library/node:18 AS builder

WORKDIR /app

# Copy package files and install pnpm globally
COPY package*.json ./
RUN npm install -g pnpm

# Install dependencies using npm (you can switch to pnpm if needed)
RUN npm install --legacy-peer-deps

# Copy the full project
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Production stage
FROM public.ecr.aws/docker/library/node:18-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the app port
EXPOSE 3030

# Start the Next.js server
CMD ["npx", "next", "start", "-p", "3030"]
