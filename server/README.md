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