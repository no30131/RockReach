FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 7000

CMD ["node", "app.js"]
