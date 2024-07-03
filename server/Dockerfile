FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 7000

CMD ["node", "app.js"]
