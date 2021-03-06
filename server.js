'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT || 8000;

// Application Middleware
app.use(express.urlencoded({extended:true}));

// Set the file locations for ejs templates and static files like CSS
app.use(express.static('public'));

// Load environment variables from .env file
require('dotenv').config();

// Database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
app.get('/new', newSearch); // Renders the search form
app.get('books/:id', bookDetails);
app.get('/', bookList);
app.post('/searches', createSearch); // New search 

//listening on port
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// Catch-all for errors
app.get('*', (request, response) => response.render(`pages/error`));


// MODEL //
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title || 'Title not available.';
  this.image = info.imageLinks.thumbnail || placeholderImage;
  this.authors = info.authors;
  this.description = info.description || "Book summary not available";
  this.isbn = info.isbn || 'ISBN Not Available';
  this.id = info.industryIdentifiers;
}

// HELPER FUNCTIONS
// Note that .ejs file extension is not required

function bookList(request, response){
  const SQL = `SELECT * FROM books;`;
  // const values = [request.query.items];

  return client.query(SQL)
    .then(results => response.render('pages/index', { bookList:results.rows }))
    .catch(err=> console.error(err));
}

function newSearch(request, response) {
  response.render('pages/searches/new'); //location for ejs files
  app.use(express.static('./public'));//location for other files like css
}

function bookDetails(request, response) {
  const SQL = `SELECT * FROM books WHERE id=$1;`;
  let values = [request.params.book_id];

  return client.query(SQL, values)
    .then(results => response.render('pages/books/detail', { book:results.rows[0]}))
    .catch(err=> console.error(err));
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
  if (request.body.search[1] === 'genre') { url += `+ingenre:${request.body.search[0]}`; }

  superagent.get(url)
  //.then(apiResponse => response.send(apiResponse.body));
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(bookInstances => response.render('pages/searches/show', {searchResults: bookInstances}));
}



