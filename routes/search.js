var express = require('express')
var router = express.Router()
var sqlite = require('spatialite')
var db = new sqlite.Database('./db.sqlite')


// *** ROUTES ***
// Example (3 miles from capital): http://localhost:3000/results?zip=80203&miles=3
router.get('/results', function (req, res, next) {
  // CAPITAL is 80203, lat: 39.64, -104.87
  // TODO Validate query parameters
  let zip = req.query.zip
  let miles = req.query.miles
  // Calculate the number of kilometers
  let meters = miles * 1.609344 * 1000

  db.spatialite(() => {
    db.serialize(() => {
      // TODO Optimize with prepared statement
      let zipLookup = "SELECT lat, lon FROM zip_codes WHERE zip='" + zip + "'"
      db.get(zipLookup, (error, row) => {
        if (!error) {
          let lat = row.lat
          let lon = row.lon

          // Find locations
          const locationLookup = "SELECT * FROM locations WHERE (PtDistWithin(locations.geometry, MakePoint(" + lon + "," + lat + ", 4326)," + meters + ")=TRUE)"
          console.log(locationLookup)
          // const locationLookup = "SELECT * FROM locations"
          // TODO Optimize with prepared statement
          db.all(locationLookup, (error, rows) => {
            if (!error) {
              res.render('results.njk', {rows: rows})
            }
            else {
              console.log("Radius Search Error: " + error)
            }
          });

        }
        else {
          console.log("Lat/Lon Error: " + error)
        }

      });
    })
  })
})


module.exports = router
