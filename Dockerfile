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
# https://nextjs.org/docs/messages/missing-env-value
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application without running linting
RUN npx next build --no-lint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files for the standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set the correct permission for files
RUN chown -R nextjs:nodejs .

USER nextjs

# Expose the port the app will run on
EXPOSE 8661

# Update the Next.js start command to use the custom port
ENV PORT 8661

# Start the application
CMD ["node", "server.js"] 