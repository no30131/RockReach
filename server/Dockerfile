FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/server

EXPOSE 7000

CMD ["node", ".../app.js"]
