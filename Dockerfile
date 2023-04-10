FROM composer:2.5.5 AS composer

FROM debian:11.6 AS build

RUN apt-get update && apt-get install -y curl

COPY ./dashboard /dashboard

WORKDIR /dashboard

SHELL [ "/bin/bash", "-l", "-c" ]

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN nvm install && nvm use 

RUN npm install 
RUN npm run build

COPY ./plugin /plugin
WORKDIR /

RUN cp -r dashboard/dist/assets/* plugin/templates/assets/
RUN cp dashboard/dist/dashboard.html plugin/templates/
RUN cp dashboard/dist/logo.jpeg plugin/templates/

FROM php:8.2.4-zts-alpine3.16

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY --from=build /plugin /app

WORKDIR /app
RUN composer install
