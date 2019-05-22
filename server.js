'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT || 8000;

// Application Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
// Renders the search form
app.get('/', newSearch);


// Creates a new search to the Google Books API
app.post('/searches', createSearch);

//listening on port
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// Catch-all for errors
app.get('*', (request, response) => response.render(`pages/error`));


// MODEL //
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.image = info.image || placeholderImage;
  this.title = info.title || 'Title not available.';
  this.authors = info.authors;
  this.bookSummary = info.bookSummary //|| placeholder.bookSummary;
  this.link = info.booklink //|| placeholder.booklink;
}

// HELPER FUNCTIONS
// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index');
}

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  let query = request.body.search[0];
    console.log(query);

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  

  superagent.get(url)
  //.then(apiResponse => response.send(apiResponse.body));
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(bookInstances => response.render('pages/searches/show', {searchResults: bookInstances}));
}

//====== STRETCH GOAL FOR GENRE ========// 
  //if (request.body.search[1] === 'genre') { url += `+ingenre:${request.body.search[0]}`; }
