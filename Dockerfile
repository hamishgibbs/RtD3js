FROM node:latest

WORKDIR /usr/RtD3js

COPY package*.json ./

RUN npm install

COPY . .

