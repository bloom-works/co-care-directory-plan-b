var express = require('express')
var sqlite = require('spatialite')
var router = express.Router()
var db = new sqlite.Database(':memory:')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.njk')
})

module.exports = router
