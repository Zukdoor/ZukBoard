FROM keymetrics/pm2:latest-alpine

# Bundle APP files
RUN mkdir app
COPY public /app/public
COPY build /app/build
COPY db /app/db
COPY server /app/server
COPY src /app/src
COPY .babelrc .eslintignore .eslintrc.js .postcssrc.js config.js app.js package.json yarn.lock ecosystem.config.js /app/
COPY entrypoint.sh .

# Install app dependencies
RUN apk update && apk add python
RUN cd app && yarn install

# Expose the listening port of your app
EXPOSE 4089

ENTRYPOINT [ "sh", "/entrypoint.sh" ]