<p align="center">

<img src="assets/d2g-logo.png"/>

</p> 

Destiny 2 Guessr web application with games and quizz about Destiny 2 developed with Django, PostgreSQL, PyTorch and Docker.

Currently deployed at  [destiny2guessr.netlify.app/en](destiny2guessr.netlify.app/en)

![d2g_preview](assets/Destiny_2_Guessr_preview.png)
![AngularVision](assets/exo_challenge.png)  

### 🏡 Setup for local deployment

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Node.js](	https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
1. Install [Python env](https://www.python.org/downloads/), [Postgres](https://www.postgresql.org) and [Node.js](https://nodejs.org/en).


2. Clone git repository :
`git clone https://github.com/Yoannmont/Destiny-2-guessr.git`

3. Start **Database** :
Create a Postgres Database and put connection credientials in server/settings.py

4. Start **Server**:
In terminal :
- Ensure you're in server folder (or run `cd app`) 
- Install libraries by running `pip install -r requirements.txt`
- Build app by running `django-admin runserver [address]:[port]`

### 🐳 Setup for Docker deployment

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (and create an account).

2. Clone git repository :
`git clone https://github.com/Yoannmont/Destiny-2-guessr.git`

3. Build client, database and server apps in containers by running
`docker compose up` (Default ports : Web app 4200, Server 8000, Database 5432).

### Default settings

Database parameters are set as environment variables : 
- POSTGRES_PASSWORD = d2guessrlib_password
- POSTGRES_USER = d2guessrlib_user
- POSTGRES_DB = d2guessrlib_db

##

## Developed with 

- **Django**: Python backend for API.
- **PostgreSQL** : Database management system.
- **Angular CLI 17.3**: Front-end framework for user interface development.
- **Docker**: Application containerization.
