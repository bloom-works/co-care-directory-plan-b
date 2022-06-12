var express = require('express')
var nunjucks = require('nunjucks')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')

var app = express()

// Configure Nunjucks as the template engine
nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

module.exports = app
