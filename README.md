
# GamesFeed Server

Server side for the GamesFeed project.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`
`CLIENT_URL`
`NEWS_API_URL`
`NEWS_API_KEY`
`DB_HOST`
`DB_LOCAL_DBNAME`
`DB_LOCAL_USER`
`DB_LOCAL_PASSWORD`
`JWT_SECRET`


## Run Locally

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## Tech Stack

Node, Express, Knex, MySQL


## API Reference

#### Get all news articles

```http
  GET /news
```

#### Get all friend recommended news articles

```http
  GET /news/recommend
```

#### Get all news articles if unregistered

```http
  GET /news/unregistered
```

#### Post a new signup

```http
  POST /user/signup
```

#### Post a new login

```http
  POST /user/login
```

#### Get user data

```http
  GET /user
```

#### Delete a user

```http
  DELETE /user
```

#### Get user preferences

```http
  GET /user/prefs
```

#### Post user preferences

```http
  POST /user/prefs
```

#### Get all preferences

```http
  GET /user/allprefs
```

#### Get user friends

```http
  GET /user/friends
```

#### Post user friends

```http
  POST /user/friends
```

#### Get user recommendations

```http
  GET /user/prefs
```

#### Post user recommendations

```http
  POST /user/prefs
```


## Lessons Learned

It's imperative to locate data sources which produce useful data relevant for your project and ideas.


## Roadmap

- Add integrations with various newsapi's


## Authors

- [@tonywucs](https://www.github.com/tonywucs)

