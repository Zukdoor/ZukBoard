FROM keymetrics/pm2:latest-alpine

# Bundle APP files
RUN mkdir app
COPY public /app/public/
COPY db /app/db
COPY server /app/server/
COPY src /app/src
COPY config.js /app
COPY app.js /app
COPY package.json /app
COPY yarn.lock /app
COPY ecosystem.config.js /app
COPY entrypoint.sh .

# Install app dependencies
RUN cd app && yarn install

# Expose the listening port of your app
EXPOSE 4089

ENTRYPOINT [ "sh", "/entrypoint.sh" ]