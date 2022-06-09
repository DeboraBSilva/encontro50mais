FROM node:13-alpine
RUN apk add --no-cache tzdata
 ENV TZ=America/Sao_Paulo
 RUN cp /usr/share/zoneinfo/$TZ /etc/localtime
WORKDIR /encontro50mais
copy ./package.json .
RUN npm install
copy . .
EXPOSE 3000
CMD node app.js
