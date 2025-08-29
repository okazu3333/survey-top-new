# Use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/apps ./apps
COPY --from=prerelease /usr/src/app/packages ./packages
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/bun.lockb .
COPY --from=prerelease /usr/src/app/turbo.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .

# Setup database
RUN cd packages/database && bun run db:generate
RUN cd packages/database && DATABASE_URL="file:./dev.db" bun run db:reset

# Build the application
RUN bun run build

# Expose port and start the application
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./packages/database/dev.db"

CMD ["bun", "run", "start"] 