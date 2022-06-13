var express = require('express')
var nunjucks = require('nunjucks')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var indexRouter = require('./routes/index')
var searchRouter = require('./routes/search')
var sqlite = require('spatialite')
const fs = require('fs')


// *** CREATE DATABASE ***
var locationsDataPath = "./data/ladders_20200304.geojson"
if (process.env.LOCATIONS_DATA_FILE) {
    locationsDataPath = process.env.LOCATIONS_DATA_FILE
}

var zipDataPath = "./data/colorado_zip_latlong.json"
if (process.env.ZIP_DATA_FILE) {
    zipDataPath = process.env.ZIP_DATA_FILE
}

var dbPath = './db.sqlite'
try {
    fs.accessSync(dbPath, fs.constants.F_OK) // throw an error if it doesn't exist
    console.log('Using existing database')
}
catch (error) {
    // TODO Make sure this is done before moving on (async/await/promise?)
    console.log('Creating new database file. Please wait...')
    var db = new sqlite.Database(dbPath)
    db.spatialite(() => {
        db.serialize(() => {
            // Initiatize Spatialite
            db.run("SELECT InitSpatialMetaData()")

            // *** LOCATIONS ***
            // Create the locations table
            db.run("CREATE TABLE locations (name TEXT, street TEXT, city TEXT, state TEXT, zip TEXT, lat TEXT, lon TEXT)")

            // Load data from the GeoJSON file
            const insertLocationsStmt = db.prepare('INSERT INTO locations VALUES (?,?,?,?,?,?,?)')
            fs.readFile(locationsDataPath, 'utf-8', (error, data) => {
                if (error) {
                    console.log('Could not load data file')
                }
                else {
                    const locationsData = JSON.parse(data)
                    locationsData.features.forEach(feature => {
                        let props = feature.properties
                        if (feature.geometry) {
                            insertLocationsStmt.run(
                                props.Account_Name,
                                props.Address,
                                props.City,
                                props.State,
                                props.Zip,
                                props.LATITUDE,
                                props.LONGITUDE
                            )
                        }
                    })
                }
            })

            // Add geometry data
            // ^ For some reason, inserting with a prepared statement with a value of "GeomFromText('POINT(" + props.LONGITUDE + " " + props.LATITUDE + ", 4326)" does not work, so adding the data after the fact
            db.run("SELECT AddGeometryColumn('locations','geometry', 4326,'POINT',2)")
            db.run("UPDATE locations SET geometry = GeomFromText('POINT('||\"lon\"||' '||\"lat\"||')',4326)")

            // *** ZIP CODES ***
            db.run("CREATE TABLE zip_codes (zip TEXT, lat TEXT, lon TEXT)")
            // Load data from the GeoJSON file
            const insertZipCodeStmt = db.prepare('INSERT INTO zip_codes VALUES (?,?,?)')
            fs.readFile(zipDataPath, 'utf-8', (error, data) => {
                if (error) {
                    console.log('Could not load ZIP code data file')
                }
                else {
                    const zipData = JSON.parse(data)
                    for (let zipCode in zipData) {
                        // console.log(zip)
                        insertZipCodeStmt.run(
                            zipCode,
                            zipData[zipCode].lat,
                            zipData[zipCode].lng
                        )
                    }
                }
            })

            // Add geometry data
            db.run("SELECT AddGeometryColumn('zip_codes','geometry', 4326,'POINT',2)")
            db.run("UPDATE zip_codes SET geometry = GeomFromText('POINT('||\"lon\"||' '||\"lat\"||')',4326)", (error) => {
                if(!error) {
                    console.log("Database created! Ready to serve requests.")
                }
            })
        })
    })
}




// *** SETUP EXPRESS ***
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
app.use('/', searchRouter)



module.exports = app
