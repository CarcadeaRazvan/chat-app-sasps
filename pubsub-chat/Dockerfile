FROM node:18-alpine

WORKDIR /app

# Copy dependencies and install
COPY package.json ./
RUN npm install

# Copy source files
COPY server/ ./server/
COPY client/ ./client/
COPY ecosystem.config.js ./

# Expose the HTTP gateway port
EXPOSE 3000

# Install PM2 globally
RUN npm install -g pm2

# Use PM2 to run both the HTTP gateway and Pub/Sub server
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
