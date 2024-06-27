FROM node:20

WORKDIR /app

# COPY package*.json ./
# RUN npm install
COPY server/package*.json ./server/
RUN cd server && npm install

# COPY client/package*.json ./client/
# RUN cd client && npm install

COPY . .

# RUN cd client && npm run build

# RUN mv client/build server/build

EXPOSE 7000

CMD ["node", "server/app.js"]
