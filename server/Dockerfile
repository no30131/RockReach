FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y nodejs npm build-essential libglib2.0-0 libsm6 libxext6 libxrender-dev

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 7000

CMD ["node", "app.js"]
