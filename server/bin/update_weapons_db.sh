#!/bin/sh
# Wrapper invoked by crontab to refresh the Destiny 2 weapons/armor database from Bungie's manifest.
# Uses flock so an overlapping run (e.g. a slow download) is skipped instead of running concurrently.
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
LOCKFILE=/tmp/update_weapons_db.lock
LOG_PREFIX=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

exec 9>"$LOCKFILE"
if ! flock -n 9; then
    echo "$LOG_PREFIX [update_weapons_db] Update already running, skipping this run."
    exit 0
fi

cd "$SCRIPT_DIR"

echo "$LOG_PREFIX [update_weapons_db] Starting Destiny 2 weapons/armor database update"
"$SCRIPT_DIR/.venv/bin/python" manage.py populate_db
echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') [update_weapons_db] Update finished"
