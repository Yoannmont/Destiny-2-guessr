# D2Guessr Backend
D2Guessr Backend is a Django-based project that provides core functionality for the D2Guessr application. It allows users to register, log in, and link their Bungie accounts to access and view their Destiny 2 inventory.

The backend is organized into two main Django apps:

- D2Guessr Library
- D2Guessr Authentication

## D2Guessr Library
The Library app manages all Destiny 2 inventory data, including weapons, armor, and other collectible items.

It exposes a simple REST API that provides detailed information about:

- Weapon and armor
- Damage types
- Item categories
- Tiers
- Classes (Hunter, Warlock, Titan)

This serves as the core reference database for the frontend game logic and player comparisons.

## D2Guessr Authentication
The Authentication app handles user account management and Bungie integration.

Key features include:

- User registration and login
- OAuth-based Bungie account linking
- Fetching and storing inventory data from the user's Bungie account
- This integration is powered by the social-auth-app-django package (formerly social_django), using Bungie as an OAuth2 provider.


To run:
- copy .env.example content to a new .env and replace with your settings.
- run bin/mkvenv
- Ready !

## Destiny 2 weapons/armor database updates
The `populate_db` management command (`d2guessrlib/management/commands/populate_db.py`)
downloads Bungie's manifest and imports/updates weapons, armor and related reference data.
It is a no-op if the manifest version hasn't changed since the last run.

In the Docker image, this command is scheduled automatically via cron
(`server/cron/populate_db.cron`, wrapped by `server/bin/update_weapons_db.sh`) and runs
once a day. Logs are written to `logs/cron_populate_db.log` inside the container.

To run it manually:
```
.venv/bin/python manage.py populate_db --force-update
```
