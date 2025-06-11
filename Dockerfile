# Stage 1: Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Production stage (non-Alpine to support sharp)
FROM node:18-slim

# Install necessary dependencies for sharp
RUN apt-get update && \
    apt-get install -y \
        libvips-dev \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3030

# Start the app
CMD ["npx", "next", "start", "-p", "3030"]
