var sqlite = require('spatialite')
var db = new sqlite.Database(':memory:')

db.spatialite(() => {
    db.run('SELECT InitSpatialMetaData()')
    db.run("CREATE TABLE test_geo (name TEXT, latitude TEXT, longitude TEXT)")
    db.run("SELECT AddGeometryColumn('test_geo','geometry',4326,'POINT',2)")
});

db.close();
