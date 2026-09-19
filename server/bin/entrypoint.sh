#!/bin/sh

if [ ! -f .env ]; then
  echo "[WARNING] .env not found. Using .env.example"
  cp .env.example .env
fi

# Cron runs jobs with a minimal environment, so make the container's env vars
# (DB URL, Bungie API keys, etc.) available to the scheduled weapons DB update.
printenv | grep -v -E '^(HOME|PWD|SHLVL|_)=' > /etc/environment

# Start the cron daemon in the background for the scheduled weapons DB update
cron

exec "$@"
