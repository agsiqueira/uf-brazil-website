FROM node:24-alpine
WORKDIR /app
COPY server.cjs index.html signup.html styles.css site.js site-config.js ./
COPY assets/ ./assets/
COPY ["Colorful street scene of Salvador, Brazil.jpg", "/app/"]
USER node
ENV PORT=80
EXPOSE 80
CMD ["node", "server.cjs"]
