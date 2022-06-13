var express = require('express')
var router = express.Router()


// *** ROUTES ***

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.njk')
})

module.exports = router
