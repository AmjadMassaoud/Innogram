ARG APP_NAME=api-gateway

FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx nest build ${APP_NAME}


FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

CMD [ "node", "dist/apps/Innogram/main.js" ]
