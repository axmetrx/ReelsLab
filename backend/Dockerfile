FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl sqlite3 ca-certificates
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl sqlite3 ca-certificates
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
