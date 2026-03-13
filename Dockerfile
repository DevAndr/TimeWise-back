FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 3031
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
