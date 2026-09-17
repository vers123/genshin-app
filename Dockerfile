FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

# Environment variables (override at runtime with --env-file .env)
# PORT=3000
# RESULT_LANGUAGE=ChineseSimplified
# DEFAULT_PAGE=1
# DEFAULT_PAGE_SIZE=24
