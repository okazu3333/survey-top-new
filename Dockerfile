# Use the official Bun image with fixed version
FROM oven/bun:1.2.18 as base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN bun install

# Copy source code and build
COPY . .
ENV NODE_ENV=production

# Build only the web app (API is embedded as a package)
RUN cd apps/web && bun run build

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /usr/src/app

USER nextjs

# Expose port and start the web application
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the Next.js web app (which includes the API routes)
CMD ["bun", "--cwd", "apps/web", "start"] 