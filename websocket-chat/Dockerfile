FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server/ server/
COPY client/ client/

EXPOSE 8080
CMD ["node", "server/web-server.js"]
