#!/bin/sh

if [ ! -f .env ]; then
  echo "[WARNING] .env not found. Using .env.example"
  cp .env.example .env
fi

exec "$@"
