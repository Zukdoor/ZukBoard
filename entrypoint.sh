#!/bin/sh
set -e

cd app

exec pm2 start ecosystem.config.js --env now "$@"