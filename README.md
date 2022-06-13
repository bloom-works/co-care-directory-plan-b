# co-care-directory-plan-b

TODO: Update this to actually be readable

1. Startup Docker for Desktop
2. Clone this repo and navigate into the base
3. docker build -t co-care-directory .
4. docker run -it --rm -v $PWD:/app -p 3000:3000 co-care-directory bash
5. npm install
6. npm start
7. http://localhost:3000/results?zip=80203&miles=3 (change zip and mile radius)
