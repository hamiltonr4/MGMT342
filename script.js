const state = {
    energyDrinks: [],
    books: [],
    movies: [],
};

const storageKeys = {
    energy: 'energyDrinksData',
    books: 'readingTrackerData',
    movies: 'movieTrackerData',
};

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('siteTheme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('siteTheme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
}

function renderTable(tableId, rows, columns) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';

    if (!rows.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = columns;
        td.textContent = 'No entries yet. Add one using the form above!';
        td.className = 'small-text';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        const removeTd = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = 'Remove';
        button.style.background = '#e55d87';
        button.style.margin = '0';
        button.onclick = () => removeRow(tableId, index);
        removeTd.appendChild(button);
        tr.appendChild(removeTd);
        tbody.appendChild(tr);
    });
}

function removeRow(tableId, index) {
    if (tableId === 'energy-table') {
        state.energyDrinks.splice(index, 1);
        saveData(storageKeys.energy, state.energyDrinks);
        renderEnergyTracker();
    }
    if (tableId === 'reading-table') {
        state.books.splice(index, 1);
        saveData(storageKeys.books, state.books);
        renderReadingTracker();
    }
    if (tableId === 'movies-table') {
        state.movies.splice(index, 1);
        saveData(storageKeys.movies, state.movies);
        renderMovieTracker();
    }
}

function renderEnergyTracker() {
    const filter = document.getElementById('energy-filter').value;
    const filtered = filter === 'all'
        ? state.energyDrinks
        : state.energyDrinks.filter(item => item.brand.toLowerCase() === filter.toLowerCase());
    renderTable('energy-table', filtered, 6);
    const avg = filtered.reduce((sum, item) => sum + Number(item.rating), 0) / Math.max(filtered.length, 1);
    document.getElementById('energy-summary').textContent = `${filtered.length} flavor(s), average rating ${filtered.length ? avg.toFixed(1) : '–'}`;
}

function renderReadingTracker() {
    renderTable('reading-table', state.books.map(book => ({
        title: book.title,
        author: book.author,
        genre: book.genre,
        status: book.status,
        rating: book.rating,
    })), 6);
    const finished = state.books.filter(book => book.status === 'Finished').length;
    document.getElementById('reading-summary').textContent = `${state.books.length} book(s) logged, ${finished} finished`;
}

function renderMovieTracker() {
    renderTable('movies-table', state.movies.map(movie => ({
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        rating: movie.rating,
        review: movie.review,
    })), 6);
    const top = state.movies
        .filter(movie => movie.rating)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map(movie => movie.title)
        .join(', ');
    document.getElementById('movie-summary').textContent = `${state.movies.length} movie(s) tracked · Top picks: ${top || 'none yet'}`;
}

function addEnergyDrink(event) {
    event.preventDefault();
    const brand = document.getElementById('energy-brand').value.trim();
    const flavor = document.getElementById('energy-flavor').value.trim();
    const rating = document.getElementById('energy-rating').value;
    const notes = document.getElementById('energy-notes').value.trim();
    if (!brand || !flavor) return;
    state.energyDrinks.push({
        brand,
        flavor,
        rating: rating || '0',
        notes,
        added: new Date().toLocaleDateString(),
    });
    saveData(storageKeys.energy, state.energyDrinks);
    event.target.reset();
    updateBrandFilter();
    renderEnergyTracker();
}

function addBook(event) {
    event.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const genre = document.getElementById('book-genre').value.trim();
    const status = document.getElementById('book-status').value;
    const rating = document.getElementById('book-rating').value;
    if (!title || !author) return;
    state.books.push({ title, author, genre, status, rating: rating || '0' });
    saveData(storageKeys.books, state.books);
    event.target.reset();
    renderReadingTracker();
}

function addMovie(event) {
    event.preventDefault();
    const title = document.getElementById('movie-title').value.trim();
    const year = document.getElementById('movie-year').value.trim();
    const genre = document.getElementById('movie-genre').value.trim();
    const rating = document.getElementById('movie-rating').value;
    const review = document.getElementById('movie-review').value.trim();
    if (!title) return;
    state.movies.push({ title, year, genre, rating: rating || '0', review });
    saveData(storageKeys.movies, state.movies);
    event.target.reset();
    renderMovieTracker();
}

function updateBrandFilter() {
    const select = document.getElementById('energy-filter');
    const brands = [...new Set(state.energyDrinks.map(item => item.brand))].sort();
    const selected = select.value || 'all';
    select.innerHTML = '<option value="all">All Brands</option>' + brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    select.value = brands.includes(selected) ? selected : 'all';
}

function init() {
    loadTheme();
    state.energyDrinks = loadData(storageKeys.energy);
    state.books = loadData(storageKeys.books);
    state.movies = loadData(storageKeys.movies);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const energyForm = document.getElementById('energy-form');
    const readingForm = document.getElementById('reading-form');
    const moviesForm = document.getElementById('movies-form');
    const energyFilter = document.getElementById('energy-filter');
    const clearEnergy = document.getElementById('clear-energy');
    const clearBooks = document.getElementById('clear-books');
    const clearMovies = document.getElementById('clear-movies');

    if (energyForm) {
        energyForm.addEventListener('submit', addEnergyDrink);
    }
    if (readingForm) {
        readingForm.addEventListener('submit', addBook);
    }
    if (moviesForm) {
        moviesForm.addEventListener('submit', addMovie);
    }
    if (energyFilter) {
        energyFilter.addEventListener('change', renderEnergyTracker);
    }
    if (clearEnergy) {
        clearEnergy.addEventListener('click', () => {
            state.energyDrinks = [];
            saveData(storageKeys.energy, state.energyDrinks);
            updateBrandFilter();
            renderEnergyTracker();
        });
    }
    if (clearBooks) {
        clearBooks.addEventListener('click', () => {
            state.books = [];
            saveData(storageKeys.books, state.books);
            renderReadingTracker();
        });
    }
    if (clearMovies) {
        clearMovies.addEventListener('click', () => {
            state.movies = [];
            saveData(storageKeys.movies, state.movies);
            renderMovieTracker();
        });
    }

    if (energyFilter) {
        updateBrandFilter();
        renderEnergyTracker();
    }
    if (readingForm) {
        renderReadingTracker();
    }
    if (moviesForm) {
        renderMovieTracker();
    }
}

window.addEventListener('DOMContentLoaded', init);
