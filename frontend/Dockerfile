# EcoCycle Frontend Angular - imagen de producción (multi-stage)
FROM node:20 AS build
WORKDIR /app

COPY front/package*.json ./
RUN npm install

COPY front/ .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/front/browser /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
