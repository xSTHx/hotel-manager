// ===== NAWIGACJA MIĘDZY WIDOKAMI =====

const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');

function showView(viewName) {
    views.forEach(function(view) {
        view.classList.remove('active');
    });

    navLinks.forEach(function(link) {
        link.classList.remove('active');
    });

    document.getElementById('view-' + viewName).classList.add('active');

    navLinks.forEach(function(link) {
        if (link.dataset.view === viewName) {
            link.classList.add('active');
        }
    });
}

navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        showView(this.dataset.view);

        // zamknij sidebar na mobile po kliknięciu
        sidebar.classList.remove('open');
    });
});


// ===== MENU MOBILNE =====

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
});


// ===== MODAL: NOWA REZERWACJA =====

const modalReservation = document.getElementById('modalRezerwacja');
const btnNewReservation = document.getElementById('btnNowaRezerwacja');
const btnCloseModal = document.getElementById('btnZamknijModal');
const btnCancelForm = document.getElementById('btnAnulujForm');

btnNewReservation.addEventListener('click', function() {
    modalReservation.classList.remove('hidden');
});

btnCloseModal.addEventListener('click', function() {
    modalReservation.classList.add('hidden');
});

btnCancelForm.addEventListener('click', function() {
    modalReservation.classList.add('hidden');
});

// zamknij modal po kliknięciu w tło
modalReservation.addEventListener('click', function(e) {
    if (e.target === modalReservation) {
        modalReservation.classList.add('hidden');
    }
});


// ===== FORMULARZ: WALIDACJA =====

const formReservation = document.getElementById('formRezerwacja');

formReservation.addEventListener('submit', function(e) {
    e.preventDefault();

    const guest = document.getElementById('gosc').value.trim();
    const room = document.getElementById('pokoj').value;
    const checkIn = document.getElementById('przyjazd').value;
    const checkOut = document.getElementById('wyjazd').value;

    if (!guest || !room || !checkIn || !checkOut) {
        alert('Wypełnij wszystkie pola.');
        return;
    }

    if (checkOut <= checkIn) {
        alert('Data wyjazdu musi być późniejsza niż data przyjazdu.');
        return;
    }

    alert('Rezerwacja dodana!');
    modalReservation.classList.add('hidden');
    formReservation.reset();
});


// ===== RENDEROWANIE POKOI =====

function renderRooms(rooms) {
    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = '';

    const badgeMap = {
        'Wolny':        'badge--green',
        'Zajęty':       'badge--red',
        'W sprzątaniu': 'badge--yellow'
    };

    rooms.forEach(function(room) {
        const badgeClass = badgeMap[room.status] || 'badge--gray';

        const div = document.createElement('div');
        div.className = 'room-card';
        div.innerHTML =
            '<div class="room-number">' + room.number + '</div>' +
            '<div class="room-type">' + room.type + '</div>' +
            '<div class="room-price">' + room.price + ' zł / noc</div>' +
            '<span class="badge ' + badgeClass + '">' + room.status + '</span>';
        grid.appendChild(div);
    });
}


// ===== RENDEROWANIE REZERWACJI =====

function renderReservations(reservations) {
    const tbody = document.getElementById('tbody-rezerwacje');
    tbody.innerHTML = '';

    const badgeMap = {
        'Potwierdzona': 'badge--green',
        'Zakończona':   'badge--gray',
        'Anulowana':    'badge--gray'
    };

    reservations.forEach(function(res) {
        const badgeClass = badgeMap[res.status] || 'badge--gray';

        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + res.guest + '</td>' +
            '<td>' + res.room + '</td>' +
            '<td>' + res.checkIn + '</td>' +
            '<td>' + res.checkOut + '</td>' +
            '<td><span class="badge ' + badgeClass + '">' + res.status + '</span></td>' +
            '<td>' +
                '<button class="btn btn--small">Edytuj</button> ' +
                '<button class="btn btn--small btn--danger">Anuluj</button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}


// ===== RENDEROWANIE GOŚCI =====

function renderGuests(guests) {
    const tbody = document.getElementById('tbody-goscie');
    tbody.innerHTML = '';

    guests.forEach(function(guest) {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + guest.name + '</td>' +
            '<td>' + guest.phone + '</td>' +
            '<td>' + guest.email + '</td>';
        tbody.appendChild(tr);
    });
}


// ===== AKTUALIZACJA DASHBOARDU =====

function updateDashboard(rooms, reservations) {
    const today = new Date().toISOString().split('T')[0];

    // statystyki pokoi
    const total    = rooms.length;
    const free     = rooms.filter(function(r) { return r.status === 'Wolny'; }).length;
    const occupied = rooms.filter(function(r) { return r.status === 'Zajęty'; }).length;
    const cleaning = rooms.filter(function(r) { return r.status === 'W sprzątaniu'; }).length;

    document.getElementById('stat-wszystkie').textContent = total;
    document.getElementById('stat-wolne').textContent = free;
    document.getElementById('stat-zajete').textContent = occupied;
    document.getElementById('stat-sprzatanie').textContent = cleaning;

    // pasek obłożenia
    const percent = Math.round((occupied / total) * 100);
    document.getElementById('occupancy-fill').style.width = percent + '%';
    document.getElementById('occupancy-label').textContent = percent + '%';

    // dzisiejsze przyjazdy
    const arrivalsList = document.getElementById('lista-przyjazdy');
    const arrivals = reservations.filter(function(r) { return r.checkIn === today; });
    arrivalsList.innerHTML = '';
    if (arrivals.length === 0) {
        arrivalsList.innerHTML = '<li>Brak przyjazdów</li>';
    } else {
        arrivals.forEach(function(r) {
            const li = document.createElement('li');
            li.textContent = r.guest + ' - pokój ' + r.room;
            arrivalsList.appendChild(li);
        });
    }

    // dzisiejsze wyjazdy
    const departuresList = document.getElementById('lista-wyjazdy');
    const departures = reservations.filter(function(r) { return r.checkOut === today; });
    departuresList.innerHTML = '';
    if (departures.length === 0) {
        departuresList.innerHTML = '<li>Brak wyjazdów</li>';
    } else {
        departures.forEach(function(r) {
            const li = document.createElement('li');
            li.textContent = r.guest + ' - pokój ' + r.room;
            departuresList.appendChild(li);
        });
    }
}


// ===== WYPEŁNIENIE SELECTA W FORMULARZU =====

function fillRoomSelect(rooms) {
    const select = document.getElementById('pokoj');
    while (select.options.length > 1) {
        select.remove(1);
    }

    const freeRooms = rooms.filter(function(r) { return r.status === 'Wolny'; });
    freeRooms.forEach(function(r) {
        const option = document.createElement('option');
        option.value = r.number;
        option.textContent = r.number + ' - ' + r.type;
        select.appendChild(option);
    });
}


// ===== INICJALIZACJA =====

api.getRooms().then(function(rooms) {
    renderRooms(rooms);
    fillRoomSelect(rooms);

    api.getReservations().then(function(reservations) {
        renderReservations(reservations);
        updateDashboard(rooms, reservations);
    });
});

api.getGuests().then(function(guests) {
    renderGuests(guests);
});
