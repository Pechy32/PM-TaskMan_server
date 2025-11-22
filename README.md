# Project README

## Overview
This is a basic Node.js application using Express. The service listens on a configurable port and connects to a MongoDB database using environment variables.

## Requirements
- Node.js (LTS recommended)
- npm
- MongoDB (local or remote)

## Installation
Install dependencies using the preferred clean install:

```bash
npm ci
```

Otherwise, basic installation is functional as well

```bash
npm install
```

## Start
To start application, run command below. App is using `nodemon` package to watch changes during development.
```bash
npm run start
```

## Environment
All environment variables must be stored in `.env` file in root of repository. Default values are provided in `app.js`.

### App
- `PORT` = port where app is running locally
- `AUTH_ENABLED` = defines if auth middleware is used

### Database
- `DB_HOST` = host of local or remote database
- `DB_PORT` = port where database is running
- `DB_PATH` = database path specification
