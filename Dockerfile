# Use Node.js 20 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application with options to bypass type checking
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build -- --no-lint

# Expose the port the app will run on
EXPOSE 8661
ENV PORT 8661

# Start the application
CMD ["npm", "start", "--", "-p", "8661"] 