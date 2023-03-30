FROM php:8.2.4-zts-alpine3.16
COPY . /app
WORKDIR /app
RUN composer install
