# Use Node.js 20 as the base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ENV NEXT_TELEMETRY_DISABLED 1

# Default values for required build-time variables (will be overridden by Coolify)
ENV NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy-key-for-build"
ENV NEXTAUTH_URL="http://localhost:8661"
ENV NEXTAUTH_SECRET="dummy-secret-for-build"

# Build the application without running linting
RUN npx next build --no-lint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Copy all necessary files instead of using standalone mode
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set the correct permission for prerender cache
RUN chown -R nextjs:nodejs .

USER nextjs

# Expose the port the app will run on
EXPOSE 8661
ENV PORT 8661

# Start the application
CMD ["npm", "start"] 