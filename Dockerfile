FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY prisma ./prisma

RUN npx prisma generate

COPY src ./src
COPY worker.js ./
COPY config.* ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]