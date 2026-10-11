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

//adding a new book through the API
const addBookForm = document.querySelector('#add-book-form');
const addMessage = document.querySelector('#add-message');

addBookForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    //collects values
    const formData = new FormData(addBookForm);
    const bookData = Object.fromEntries(formData.entries());

    //converts number fields to numebrs
    bookData.pages = Number(bookData.pages) || 0;
    bookData.year = Number(bookData.year) || 0;

    //converts comma separated genres into an array
    bookData.genres = bookData.genres
        .split(',')
        .map((genre) => genre.trim())
        .filter((genre) => genre !== '');

    addMessage.textContent = 'Adding book...';

    try {
        const response = await fetch('/addBook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(bookData),
        });

        const data = await response.json();

        if (!response.ok) {
            addMessage.textContent = data.message || 'Unable to add book.';
            return;
        }

        addMessage.textContent = data.message;
        addBookForm.reset();

        //refresh dispaly
        fetchBooks('/getBooks?limit=12');
    } catch (error) {
        addMessage.textContent = 'An error occurred while adding the book.';
    }
});

// update an existing book
const updateBookForm = document.querySelector('#update-book-form');
const updateMessage = document.querySelector('#update-message');

updateBookForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    //collect the form values
    const formData = new FormData(updateBookForm);
    const bookData = Object.fromEntries(formData.entries());

    //remove empty fields
    Object.keys(bookData).forEach((key) => {
        if (typeof bookData[key] === 'string') {
            bookData[key] = bookData[key].trim();
        }

        if (bookData[key] === '') {
            delete bookData[key];
        }
    });

    //make sure a title was provided
    if (!bookData.title) {
        updateMessage.textContent = 'Please enter a book title.';
        return;
    }

    //convert to the correct formats
    if (bookData.pages !== undefined) {
        bookData.pages = Number(bookData.pages);
    }

    if (bookData.year !== undefined) {
        bookData.year = Number(bookData.year);
    }

    if (bookData.genres !== undefined) {
        bookData.genres = bookData.genres
            .split(',')
            .map((genre) => genre.trim())
            .filter((genre) => genre !== '');
    }

    updateMessage.textContent = 'Updating book...';

    try {
        const response = await fetch('/updateBook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(bookData),
        });

        //204 response
        if (response.status === 204) {
            updateMessage.textContent = 'No changes were provided.';
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            updateMessage.textContent = data.message || 'Unable to update book.';
            return;
        }

        updateMessage.textContent = data.message;
        updateBookForm.reset();

        //refresh
        fetchBooks('/getBooks?limit=12');
    } catch (error) {
        updateMessage.textContent = 'An error occurred while updating the book.';
    }
});

//random book recommendations
const recommendForm = document.querySelector('#recommend-form');
const recommendGenre = document.querySelector('#recommend-genre');
const recommendResult = document.querySelector('#recommend-result');

recommendForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const genre = recommendGenre.value.trim();

    //starting with the random book endpoint
    let endpoint = '/getRandomBook';

    //optional genre filter
    if (genre) {
        endpoint += `?genre=${encodeURIComponent(genre)}`;
    }

    recommendResult.textContent = 'Finding your next read...';

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            recommendResult.textContent =
                data.message || 'Unable to find a recommendation.';
            return;
        }

        //display the recommended book using our existing card function
        recommendResult.innerHTML = '';
        recommendResult.appendChild(createBookCard(data.book));
    } catch (error) {
        recommendResult.textContent =
            'An error occurred while finding a recommendation.';
    }
});