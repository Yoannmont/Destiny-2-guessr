
FROM node:20.11.1-alpine3.19

WORKDIR /webapp

COPY package.json .
COPY package-lock.json .

RUN npm i
RUN npm i -g @angular/cli


COPY . .

EXPOSE 4200
