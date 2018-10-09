FROM keymetrics/pm2:latest-alpine

# Bundle APP files
COPY src src/
COPY db db/
COPY server server/
COPY config.js .
COPY app.js .
COPY package.json .
COPY ecosystem.config.js .

# Install app dependencies
RUN npm install && npm build

# Expose the listening port of your app
EXPOSE 4089

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "now" ]