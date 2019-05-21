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
app.get('/books', getBooks);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

//ERROR HANDLER
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong')
}

// HELPER FUNCTIONS
function Books(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  const placeholder = 'default';
  this.image = placeholderImage;
  this.title = placeholder

}

function getBooks(request, response) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${this.query}&key=${process.env.BOOKS_API_KEY}`;
  superagent.get(url)
    .then(result => {
      const books = result.body.books.map(bookData => {
        const info = new Books(bookData);
        return info;
      });

      response.send(books);
    })
    .catch(error => handleError(error, response));
}

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index');
}

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  if (request.body.search[1] === 'genre') { url += `+ingenre:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Books(bookResult.volumeInfo)))
    .then(books => response.render('pages/searches/show', {searchResults: books}));

  // how will we handle errors?

}

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// Catch-all
app.get('*', (request, response) => response.render(`pages/error`));

//app.get('*', (request, response) => response.status(404).send('This route does not exist'));
