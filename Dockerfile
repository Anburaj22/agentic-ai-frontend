# ---- Builder Stage ----
FROM public.ecr.aws/docker/library/node:20 AS builder

# Install system dependencies required for sharp
RUN apt-get update && \
    apt-get install -y python3 make g++ libvips-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including optional ones)
RUN npm install --legacy-peer-deps --include=optional

# Reinstall sharp explicitly for the target architecture (linux-x64)
RUN npm install --include=optional --os=linux --cpu=x64 sharp

# Copy the rest of your app code
COPY . .

# Build your Next.js application
RUN npm run build

# ---- Runtime Stage ----
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /app

# Only copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port you're using
EXPOSE 3030

# Start the application
CMD ["npx", "next", "start", "-p", "3030"]
