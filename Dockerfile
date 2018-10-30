#
# ---- Base Node ----
FROM keymetrics/pm2:latest-alpine AS base

RUN apk add --no-cache tini
# Tini is now available at /sbin/tini

WORKDIR /root/zukboard

# Set tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# copy project file
COPY package.json .
COPY yarn.lock .

#
# ---- Dependencies ----
FROM base AS dependencies

# install node modules
RUN apk add --no-cache python make
RUN yarn install --production

# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
RUN rm -rf node_modules

# build
COPY build ./build
COPY public ./public
COPY . .
RUN yarn install && yarn build

#
# ---- Production ----
FROM base AS production

# copy production node_modules and built files
COPY --from=dependencies /root/zukboard/prod_node_modules ./node_modules
COPY --from=dependencies /root/zukboard/public ./public
COPY db ./db
COPY server ./server

# copy app sourcess
COPY . .

# Expose the listening port of your app
EXPOSE 4089

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "now" ]
