# Use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Setup database and build
RUN cd packages/database && bun run db:generate
RUN cd packages/database && DATABASE_URL="file:./dev.db" bun run db:push
# Seed the database instead of copying a prebuilt dev.db
RUN cd packages/database && DATABASE_URL="file:./dev.db" bun run db:seed

# Set environment variables before build
ENV NODE_ENV=production
ENV DATABASE_URL="file:./packages/database/dev.db"

RUN bun run build

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Ensure database file has correct permissions
RUN chown -R nextjs:nodejs packages/database/
RUN chmod 664 packages/database/dev.db

USER nextjs

# Expose port and start the application
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "start"] 