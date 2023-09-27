FROM node:latest

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Inicie o servidor de desenvolvimento
CMD ["npm", "run", "dev"]