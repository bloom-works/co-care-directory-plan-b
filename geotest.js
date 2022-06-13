var sqlite = require('spatialite')
const fs = require('fs')

// Remove the database file if it exits
// ^ using sqlite.OPEN_CREATE parameter didn't work in sqlite.Database(..)
var dbPath = './ladders.sqlite'
try {
    fs.accessSync(dbPath, fs.constants.F_OK)
    console.log('Delete exist database file')
    fs.unlinkSync(dbPath)
}
catch(error) {
    console.log('Creating new database file')
}


// Load the database
var db = new sqlite.Database(dbPath)
db.spatialite(() => {
    db.serialize(() => {
        // Initiatize Spatialite
        db.run("SELECT InitSpatialMetaData()")

        // Create the locations table
        db.run("CREATE TABLE locations (name TEXT, street TEXT, city TEXT, state TEXT, zip TEXT, lat TEXT, lon TEXT)")

        // Load data from the GeoJSON file
        const insert = db.prepare('INSERT INTO locations VALUES (?,?,?,?,?,?,?)')
        fs.readFile('./ladders.geojson', 'utf-8', (error, data) => {
            if (error) {
                console.log('Could not load data file')
            }
            else {
                const locationsData = JSON.parse(data)
                locationsData.features.forEach(feature => {
                    var props = feature.properties
                    if (feature.geometry) {
                        insert.run(
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
        
        // db.each("SELECT * FROM locations", (err, row) => {
        db.each("SELECT * FROM locations WHERE (PtDistWithin(locations.geometry, MakePoint(-103.218807,38.079344, 4326), 30000)=TRUE)", (err, row) => {
            console.log(row)
        });
    })
})