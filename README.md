# NODE TYPESCRIPT STARTER

## Features

In this module we use `nodemailer` to send mail (https://nodemailer.com/)

And `pug` as mail template system for render (https://pugjs.org/api/getting-started.html)

## Installation

1. Add environnement variables `cp .env.example .env`
2. Update variables in `.env` file
3. Install dependencies: `yarn install`
4. Build TS to JS: `yarn build`

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
