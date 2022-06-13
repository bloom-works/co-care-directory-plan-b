# co-care-directory-plan-b

TODO: Update this to actually be readable if this repo ever winds up getting used

Quick and dirty prototype showing:

- Loading a Spatialite (i.e. SQLite with GIS extension) database with ZIP code and LADDERS facility data
- Searching a mile-based radius for facilities

To try it out:

1. Startup Docker for Desktop
1. docker build -t co-care-directory .
1. docker run -it --rm -v $PWD:/app -p 3000:3000 co-care-directory bash
1. npm install
1. npm start
1. http://localhost:3000/results?zip=80203&miles=3 (change ZIP and mile radius)

The main files to look in are:

- `app.js` for loading logic 
- `routes/search.js` for the radius search
