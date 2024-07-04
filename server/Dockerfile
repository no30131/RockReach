FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

COPY package*.json ./
RUN npm install

COPY requirements.txt .
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install -r requirements.txt

COPY . .

EXPOSE 7000

CMD ["node", "app.js"]
