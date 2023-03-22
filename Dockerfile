FROM node:18-alpine
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . .
RUN yarn install --production
CMD ["yarn", "start"]