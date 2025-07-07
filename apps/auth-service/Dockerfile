FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./

COPY apps/auth-service/package.json ./apps/auth-service/

RUN npm install

COPY . .

RUN npm run build --workspace=@innogram/auth-service


FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/auth-service/package.json ./apps/auth-service/

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/apps/auth-service/dist ./dist

CMD [ "node", "dist/main.js" ]
