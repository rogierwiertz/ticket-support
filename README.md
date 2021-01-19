# TicketSupport API

> Backend API for TicketSupport application.

## Documentation
Check out the [API Documentation](https://documenter.getpostman.com/view/13970935/TVzYeE1E)

## Usage

Add "config/config.env" and add the following settings:
* NODE_ENV=[development | production]
* PORT=[port number]
* MONGO_URI=[mongoDB connection string]
* JWT_SECRET=[your secret key]
* JWT_EXPIRE=[expiration for jwt, e.g. 7d]
* JWT_COOKIE_EXPIRE=[expiration for jwt cookie, e.g. 7]

## Install dependencies
```
npm install
```

## Run app 
```
node server.js
```

## Seed database with sample data
```
# import sample data
node seeder -i

# delete sample data
node seeder -d
```

- Version: 1.0.0





