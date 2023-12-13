# NODE TYPESCRIPT STARTER

## Installation

1. Add environnement variables `cp .env.example .env`
2. Update variables in `.env` file
3. Update ***JWT_SECRET*** key in ***.env***
4. Install dependencies: `yarn install`
5. Build TS to JS: `yarn build`
6. Run migrations: `yarn sequelize-cli db:migrate`
7. Run seeders: `yarn sequelize-cli db:seed:all`

## Run development server

Serve with hot reload at http://localhost:port/ : `yarn dev`

Api will runing on  http://localhost:port/api

## Run production server

Build for production and launch server:

```
yarn build
yarn start
```


## Generate static project

`yarn generate`


## DOCKER

- Create image `docker build . -t node-typecript-starter`

- Run container `docker run -p 8000:8000 -d node-typecript-starter`

With Docker compose

- Run the containers `docker compose up -d`

- Stop the containers `docker compose down`

- Rebuild the containers `docker compose build`