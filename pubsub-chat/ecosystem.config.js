module.exports = {
  apps: [
    {
      name: "http-gateway",
      script: "./server/http-gateway.js",
      env: {
        REDIS_HOST: "redis",
        REDIS_PORT: 6379,
        HTTP_GATEWAY_PORT: 3000,
      },
    },
    {
      name: "pubsub-server",
      script: "./server/pub-sub-server.js",
      env: {
        REDIS_HOST: "redis",
        REDIS_PORT: 6379,
      },
    },
  ],
};
