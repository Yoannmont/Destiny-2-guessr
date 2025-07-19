FROM node:22.16-alpine3.22

WORKDIR /webapp

COPY package.json .
COPY package-lock.json .

RUN npm i
RUN npm i -g @angular/cli@20.1.0


COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]