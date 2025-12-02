FROM node:22-alpine
WORKDIR /server
COPY package*.json .
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
EXPOSE 5000
CMD ["sh", "-c", "node src/server.js"]