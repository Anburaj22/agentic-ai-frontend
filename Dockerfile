# Stage 1: Build the Next.js app
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the source code
COPY . .

# Build the Next.js app (this creates the `.next` build directory)
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --legacy-peer-deps --production

# Copy built files and necessary folders from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port 3030
EXPOSE 3030

# Start the Next.js app on port 3030
ENV PORT=3030
CMD ["npm", "start"]
