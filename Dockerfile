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
ENV NEXT_PUBLIC_SUPABASE_URL="https://xlknzbjppmwgwmjvdwbq.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsa256YmpwcG13Z3dtanZkd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNTgwMDEsImV4cCI6MjA1NzgzNDAwMX0.vRjsiRjSCHUiGUYadLgaoBuNuxI8m3Qs5Jhqb44EERc"
ENV NEXTAUTH_URL="https://voiceguard.intelartdo.com"
ENV NEXTAUTH_SECRET="un_secreto_muy_seguro"
ENV HOST_URL="https://voiceguard.intelartdo.com"
ENV TWILIO_ACCOUNT_SID="AC4e739d28ea5ea4b19b4b931a154e57aa"
ENV TWILIO_AUTH_TOKEN="bdd207471d8327842ccb5f52e4fb1b03"
ENV TWILIO_PHONE_NUMBER="+18335739121"
ENV OPENAI_API_KEY="sk-proj-R0bTzlBOuLQOoFpiWfIMT3BlbkFJ2hWsGglhSBVwtBX5XOc7"
ENV RESEND_API_KEY="re_jHff3wJJ_GUhSinErJ3AsGrsULskhiPEx"
ENV SUPPORT_EMAIL_FROM="soporte@automatadr.com"
ENV SUPPORT_EMAIL_TO="rainiercf66@gmail.com"

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