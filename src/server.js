const express = require('express')
const session = require('express-session')
const redis = require('redis')
const client = redis.createClient()
const RedisStore = require('connect-redis')(session)
const nunjucks = require('nunjucks')
const path = require('path')
const flash = require('connect-flash')
const dateFilter = require('nunjucks-date-filter')

class App {
  constructor () {
    this.express = express()
    this.isDev = process.env.NODE_ENV !== 'production'

    this.middlewares()
    this.views()
    this.routes()
  }

  middlewares () {
    this.express.use(express.urlencoded({ extended: false }))
    this.express.use(flash())
    this.express.use(
      session({
        name: 'root',
        store: new RedisStore({
          client: client,
          host: '127.0.0.1',
          port: '6379'
        }),
        secret: 'MyAppSecret',
        resave: false,
        saveUninitialized: false
      })
    )

    this.express.use(function (req, res, next) {
      if (!req.session) {
        return next(new Error('oh no')) // handle error
      }
      next() // otherwise continue
    })
  }

  views () {
    nunjucks
      .configure(path.resolve(__dirname, 'app', 'views'), {
        watch: this.isDev,
        express: this.express,
        autoescape: true
      })
      .addFilter('date', dateFilter)

    this.express.use(express.static(path.resolve(__dirname, 'public')))
    this.express.use(
      '/images',
      express.static(path.resolve(__dirname, 'public', 'images'))
    )
    this.express.set('view engine', 'njk')
  }

  routes () {
    this.express.use(require('./routes'))
  }
}

module.exports = new App().express
