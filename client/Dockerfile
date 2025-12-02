FROM node:22-alpine
WORKDIR /client
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]