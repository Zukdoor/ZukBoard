#!/bin/sh
set -e

cd app

exec pm2-runtime start ecosystem.config.js --env now "$@"