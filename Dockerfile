FROM keymetrics/pm2:latest-alpine

# Bundle APP files
RUN mkdir app
COPY public /app/public/
COPY db /app/db
COPY server /app/server/
COPY config.js /app
COPY app.js /app
COPY package.json /app
COPY yarn.lock /app
COPY ecosystem.config.js /app

# Install app dependencies
RUN yarn install

# Expose the listening port of your app
EXPOSE 4089

CMD [ "pm2-runtime", "start", "/app/ecosystem.config.js", "--env", "now" ]