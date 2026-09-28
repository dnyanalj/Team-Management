# Task & Team Management Platform - API image
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only (cached unless package*.json change)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source (see .dockerignore for exclusions)
COPY --chown=node:node . .

# Run as the unprivileged "node" user that ships with the official image
USER node

EXPOSE 5000

CMD ["node", "server.js"]
