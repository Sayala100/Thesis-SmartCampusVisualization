#
FROM node:21 AS builder
WORKDIR /frontend
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install --force --silent
COPY . .
EXPOSE 3000
CMD ["npm", "start"]