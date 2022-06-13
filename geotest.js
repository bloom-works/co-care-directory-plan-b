var sqlite = require('spatialite')
const fs = require('fs')
var db = new sqlite.Database('./ladders.sqlite')

db.spatialite(() => {
    db.serialize(() => {
        db.run('SELECT InitSpatialMetaData()')
        db.run("CREATE TABLE locations (name TEXT, street TEXT, city TEXT, state TEXT, zip TEXT, lat TEXT, lon TEXT)")
        
        // db.run("INSERT INTO locations VALUES ('name', 'address', 'city', 'state', 'zip', GeomFromText('POINT(1 1)', 4326))")

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
                            // "GeomFromText('POINT(" + props.LATITUDE + " " + props.LONGITUDE + ")"
                        )
                    }
                })
            }
        })
        db.run("SELECT AddGeometryColumn('locations','geometry',4326,'POINT',2)")
        db.run("UPDATE locations SET geometry = GeomFromText('POINT('||\"lon\"||' '||\"lat\"||')',4326)")
        db.each("SELECT * FROM locations", (err, row) => {
            console.log(row)
        });
    })
})