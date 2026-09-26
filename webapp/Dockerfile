FROM node:26-alpine

WORKDIR /webapp

COPY package.json .
COPY package-lock.json .

RUN npm ci


COPY . .

EXPOSE 4200

CMD ["npm", "run", "start:dev", "--", "--host", "0.0.0.0"]