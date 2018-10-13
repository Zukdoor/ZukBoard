#!/bin/sh

NOW_DEPLOY_ID=$( now --no-clipboard --regions=all --docker --token=$NOW_TOKEN -e OSS_ID=$OSS_ID -e OSS_SECRET=$OSS_SECRET -e MONGODB_URI=$MONGODB_URI -e GA_ID=$GA_ID_NOW)
now alias $NOW_DEPLOY_ID "$NOW_CUSTOM_DOMAIN" --token=$NOW_TOKEN

# There seems to be problem with deployment removal [2018-10-11]
now rm $NOW_SUBDOMAIN --safe --yes --token=$NOW_TOKEN || exit 0