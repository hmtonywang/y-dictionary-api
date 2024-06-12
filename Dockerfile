FROM node:18-alpine
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . .
RUN yarn install --production --frozen-lockfile
CMD ["yarn", "start"]