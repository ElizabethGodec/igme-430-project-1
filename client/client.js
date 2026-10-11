//getting references to the search form and results container
const searchForm = document.querySelector('#search-form');
const searchType = document.querySelector('#search-type');
const searchInput = document.querySelector('#search-input');
const resultsDiv = document.querySelector('#results');

//creates a card displaying info about a book
const createBookCard = (book) => {
    const card = document.createElement('div');
    card.classList.add('book-card');

    const title = document.createElement('h3');
    title.textContent = book.title;
    card.appendChild(title);

    const author = document.createElement('p');
    author.textContent = `Author: ${book.author}`;
    card.appendChild(author);

    const country = document.createElement('p');
    country.textContent = `Country: ${book.country || 'Unknown'}`;
    card.appendChild(country);

    const year = document.createElement('p');
    year.textContent = `Year: ${book.year}`;
    card.appendChild(year);

    const pages = document.createElement('p');
    pages.textContent = `Pages: ${book.pages}`;
    card.appendChild(pages);

    const genres = document.createElement('p');
    genres.textContent = `Genres: ${Array.isArray(book.genres) && book.genres.length > 0
        ? book.genres.join(', ')
        : 'Not specified'
        }`;
    card.appendChild(genres);

    return card;
};

//displays an array of books in the results container
const displayBooks = (books) => {
    resultsDiv.innerHTML = '';

    if (books.length === 0) {
        resultsDiv.textContent = 'No books found.';
        return;
    }

    books.forEach((book) => {
        resultsDiv.appendChild(createBookCard(book));
    });
};

// requests book data from our API
const fetchBooks = async (endpoint) => {
    resultsDiv.textContent = 'Loading books...';

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            resultsDiv.textContent = data.message || 'Unable to load books.';
            return;
        }

        const books = data.books || (data.book ? [data.book] : []);
        displayBooks(books);
    } catch (error) {
        resultsDiv.textContent = 'An error occurred while loading books.';
    }
};

//initially display the first 12 books
fetchBooks('/getBooks?limit=12');

//handles book searches
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const type = searchType.value;
    const search = searchInput.value.trim();

    let endpoint = '/getBooks?limit=12';

    if (type === 'title') {
        if (!search) {
            resultsDiv.textContent = 'Please enter a book title.';
            return;
        }

        endpoint = `/getBook?title=${encodeURIComponent(search)}`;
    } else if (type === 'author') {
        if (!search) {
            resultsDiv.textContent = 'Please enter an author.';
            return;
        }

        endpoint = `/getBooksByAuthor?author=${encodeURIComponent(search)}`;
    } else if (type === 'genre') {
        if (!search) {
            resultsDiv.textContent = 'Please enter a genre.';
            return;
        }

        endpoint = `/getBooksByGenre?genre=${encodeURIComponent(search)}`;
    }

    fetchBooks(endpoint);
});