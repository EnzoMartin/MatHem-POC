FROM nginx:1.13-alpine

# Copy configuration files
WORKDIR /etc/nginx/

COPY ./nginx/nginx.conf ./nginx/proxy_headers ./
COPY ./nginx/conf.d ./conf.d

# Copy static application files
WORKDIR /www

COPY ./nginx/static ./
