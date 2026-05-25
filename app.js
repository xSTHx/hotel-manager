const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

const modalReservation = document.getElementById('modalRezerwacja');
const modalTitle = modalReservation.querySelector('.modal-header h2');
const btnNewReservation = document.getElementById('btnNowaRezerwacja');
const btnCloseModal = document.getElementById('btnZamknijModal');
const btnCancelForm = document.getElementById('btnAnulujForm');
const formReservation = document.getElementById('formRezerwacja');
const inputGuest = document.getElementById('gosc');
const inputRoom = document.getElementById('pokoj');
const inputCheckIn = document.getElementById('przyjazd');
const inputCheckOut = document.getElementById('wyjazd');

const filterRoomType = document.getElementById('filterRoomType');
const filterRoomStatus = document.getElementById('filterRoomStatus');
const guestSearchInput = document.getElementById('szukajGosc');
const tbodyReservations = document.getElementById('tbody-rezerwacje');

const modalRoom = document.getElementById('modalPokoj');
const modalRoomTitle = modalRoom.querySelector('.modal-header h2');
const btnNewRoom = document.getElementById('btnNowyPokoj');
const btnCloseRoomModal = document.getElementById('btnZamknijModalPokoj');
const btnCancelRoomForm = document.getElementById('btnAnulujFormPokoj');
const formRoom = document.getElementById('formPokoj');
const inputRoomNumber = document.getElementById('pokoj-numer');
const inputRoomType = document.getElementById('pokoj-typ');
const inputRoomPrice = document.getElementById('pokoj-cena');
const inputRoomStatus = document.getElementById('pokoj-status');

const modalGuest = document.getElementById('modalGosc');
const modalGuestTitle = modalGuest.querySelector('.modal-header h2');
const btnNewGuest = document.getElementById('btnNowyGosc');
const btnCloseGuestModal = document.getElementById('btnZamknijModalGosc');
const btnCancelGuestForm = document.getElementById('btnAnulujFormGosc');
const formGuest = document.getElementById('formGosc');
const inputGuestName = document.getElementById('gosc-imie');
const inputGuestPhone = document.getElementById('gosc-telefon');
const inputGuestEmail = document.getElementById('gosc-email');

const roomsGrid = document.getElementById('rooms-grid');
const tbodyGuests = document.getElementById('tbody-goscie');

let rooms = [];
let reservations = [];
let guests = [];
let editingReservationId = null;
let editingRoomNumber = null;
let editingGuestId = null;
let roomTypeFilter = '';
let roomStatusFilter = '';
let guestSearchQuery = '';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function today() {
    return new Date().toISOString().split('T')[0];
}

function isActiveToday(reservation) {
    const t = today();
    return reservation.status === 'Potwierdzona'
        && reservation.checkIn <= t
        && reservation.checkOut > t;
}

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
        sidebar.classList.remove('open');
    });
});

menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
});

function openModal(reservation) {
    editingReservationId = reservation ? reservation.id : null;
    modalTitle.textContent = reservation ? 'Edytuj rezerwację' : 'Nowa rezerwacja';
    fillRoomSelect(rooms, reservation ? reservation.room : null);
    if (reservation) {
        inputGuest.value = reservation.guest;
        inputRoom.value = String(reservation.room);
        inputCheckIn.value = reservation.checkIn;
        inputCheckOut.value = reservation.checkOut;
    } else {
        formReservation.reset();
    }
    modalReservation.classList.remove('hidden');
}

function closeModal() {
    modalReservation.classList.add('hidden');
    formReservation.reset();
    editingReservationId = null;
}

btnNewReservation.addEventListener('click', function() {
    openModal(null);
});
btnCloseModal.addEventListener('click', closeModal);
btnCancelForm.addEventListener('click', closeModal);

modalReservation.addEventListener('click', function(e) {
    if (e.target === modalReservation) {
        closeModal();
    }
});

formReservation.addEventListener('submit', function(e) {
    e.preventDefault();

    const guestName = inputGuest.value.trim();
    const roomNumber = parseInt(inputRoom.value, 10);
    const checkIn = inputCheckIn.value;
    const checkOut = inputCheckOut.value;

    if (!guestName || !roomNumber || !checkIn || !checkOut) {
        alert('Wypełnij wszystkie pola.');
        return;
    }
    if (checkOut <= checkIn) {
        alert('Data wyjazdu musi być późniejsza niż data przyjazdu.');
        return;
    }

    const conflict = reservations.find(function(r) {
        if (r.status !== 'Potwierdzona') return false;
        if (r.id === editingReservationId) return false;
        if (r.room !== roomNumber) return false;
        return checkIn < r.checkOut && checkOut > r.checkIn;
    });
    if (conflict) {
        alert('Pokój jest już zarezerwowany w wybranym terminie (gość: ' + conflict.guest + ').');
        return;
    }

    if (editingReservationId !== null) {
        const reservation = reservations.find(function(r) {
            return r.id === editingReservationId;
        });
        if (reservation) {
            reservation.guest = guestName;
            reservation.room = roomNumber;
            reservation.checkIn = checkIn;
            reservation.checkOut = checkOut;
        }
    } else {
        const newId = reservations.length > 0
            ? Math.max.apply(null, reservations.map(function(r) { return r.id; })) + 1
            : 1;
        reservations.push({
            id: newId,
            guest: guestName,
            room: roomNumber,
            checkIn: checkIn,
            checkOut: checkOut,
            status: 'Potwierdzona'
        });
        const existingGuest = guests.find(function(g) {
            return g.name.toLowerCase() === guestName.toLowerCase();
        });
        if (!existingGuest) {
            const newGuestId = guests.length > 0
                ? Math.max.apply(null, guests.map(function(g) { return g.id; })) + 1
                : 1;
            guests.push({
                id: newGuestId,
                name: guestName,
                phone: '',
                email: ''
            });
        }
    }

    syncRoomStatuses();
    api.save();
    closeModal();
    refreshAll();
});

function syncRoomStatuses() {
    rooms.forEach(function(room) {
        if (room.status === 'W sprzątaniu') return;
        const occupied = reservations.some(function(r) {
            return r.room === room.number && isActiveToday(r);
        });
        if (occupied) {
            room.status = 'Zajęty';
        } else if (room.status === 'Zajęty') {
            room.status = 'Wolny';
        }
    });
}

function cancelReservation(id) {
    const reservation = reservations.find(function(r) { return r.id === id; });
    if (!reservation) return;
    if (!confirm('Anulować rezerwację dla ' + reservation.guest + '?')) return;
    reservation.status = 'Anulowana';
    syncRoomStatuses();
    api.save();
    refreshAll();
}

function openRoomModal(room) {
    editingRoomNumber = room ? room.number : null;
    modalRoomTitle.textContent = room ? 'Edytuj pokój' : 'Nowy pokój';
    if (room) {
        inputRoomNumber.value = room.number;
        inputRoomType.value = room.type;
        inputRoomPrice.value = room.price;
        inputRoomStatus.value = room.status;
    } else {
        formRoom.reset();
        inputRoomType.value = 'Jednoosobowy';
        inputRoomStatus.value = 'Wolny';
    }
    modalRoom.classList.remove('hidden');
}

function closeRoomModal() {
    modalRoom.classList.add('hidden');
    formRoom.reset();
    editingRoomNumber = null;
}

btnNewRoom.addEventListener('click', function() { openRoomModal(null); });
btnCloseRoomModal.addEventListener('click', closeRoomModal);
btnCancelRoomForm.addEventListener('click', closeRoomModal);
modalRoom.addEventListener('click', function(e) {
    if (e.target === modalRoom) closeRoomModal();
});

formRoom.addEventListener('submit', function(e) {
    e.preventDefault();
    const number = parseInt(inputRoomNumber.value, 10);
    const type = inputRoomType.value;
    const price = parseInt(inputRoomPrice.value, 10);
    const status = inputRoomStatus.value;

    if (!number || number < 1 || !type || isNaN(price) || price < 0 || !status) {
        alert('Wypełnij wszystkie pola poprawnie.');
        return;
    }

    const duplicate = rooms.find(function(r) {
        return r.number === number && r.number !== editingRoomNumber;
    });
    if (duplicate) {
        alert('Pokój o numerze ' + number + ' już istnieje.');
        return;
    }

    if (editingRoomNumber !== null) {
        const room = rooms.find(function(r) { return r.number === editingRoomNumber; });
        if (room) {
            if (room.number !== number) {
                reservations.forEach(function(r) {
                    if (r.room === room.number) r.room = number;
                });
            }
            room.number = number;
            room.type = type;
            room.price = price;
            room.status = status;
        }
    } else {
        rooms.push({ number: number, type: type, price: price, status: status });
    }

    api.save();
    closeRoomModal();
    refreshAll();
});

function deleteRoom(number) {
    const hasActive = reservations.some(function(r) {
        return r.room === number && r.status === 'Potwierdzona';
    });
    if (hasActive) {
        alert('Nie można usunąć pokoju z aktywną rezerwacją.');
        return;
    }
    if (!confirm('Usunąć pokój ' + number + '?')) return;
    const idx = rooms.findIndex(function(r) { return r.number === number; });
    if (idx !== -1) rooms.splice(idx, 1);
    api.save();
    refreshAll();
}

roomsGrid.addEventListener('click', function(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const number = parseInt(button.dataset.number, 10);
    if (button.dataset.action === 'edit-room') {
        const room = rooms.find(function(r) { return r.number === number; });
        if (room) openRoomModal(room);
    } else if (button.dataset.action === 'delete-room') {
        deleteRoom(number);
    }
});

function openGuestModal(guest) {
    editingGuestId = guest ? guest.id : null;
    modalGuestTitle.textContent = guest ? 'Edytuj gościa' : 'Nowy gość';
    if (guest) {
        inputGuestName.value = guest.name;
        inputGuestPhone.value = guest.phone || '';
        inputGuestEmail.value = guest.email || '';
    } else {
        formGuest.reset();
    }
    modalGuest.classList.remove('hidden');
}

function closeGuestModal() {
    modalGuest.classList.add('hidden');
    formGuest.reset();
    editingGuestId = null;
}

btnNewGuest.addEventListener('click', function() { openGuestModal(null); });
btnCloseGuestModal.addEventListener('click', closeGuestModal);
btnCancelGuestForm.addEventListener('click', closeGuestModal);
modalGuest.addEventListener('click', function(e) {
    if (e.target === modalGuest) closeGuestModal();
});

formGuest.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = inputGuestName.value.trim();
    const phone = inputGuestPhone.value.trim();
    const email = inputGuestEmail.value.trim();

    if (!name) {
        alert('Imię i nazwisko jest wymagane.');
        return;
    }

    const duplicate = guests.find(function(g) {
        return g.name.toLowerCase() === name.toLowerCase() && g.id !== editingGuestId;
    });
    if (duplicate) {
        alert('Gość o tym imieniu już istnieje.');
        return;
    }

    if (editingGuestId !== null) {
        const guest = guests.find(function(g) { return g.id === editingGuestId; });
        if (guest) {
            if (guest.name !== name) {
                reservations.forEach(function(r) {
                    if (r.guest === guest.name) r.guest = name;
                });
            }
            guest.name = name;
            guest.phone = phone;
            guest.email = email;
        }
    } else {
        const newId = guests.length > 0
            ? Math.max.apply(null, guests.map(function(g) { return g.id; })) + 1
            : 1;
        guests.push({ id: newId, name: name, phone: phone, email: email });
    }

    api.save();
    closeGuestModal();
    refreshAll();
});

function deleteGuest(id) {
    const guest = guests.find(function(g) { return g.id === id; });
    if (!guest) return;
    const hasActive = reservations.some(function(r) {
        return r.guest === guest.name && r.status === 'Potwierdzona';
    });
    if (hasActive) {
        alert('Nie można usunąć gościa z aktywną rezerwacją.');
        return;
    }
    if (!confirm('Usunąć gościa ' + guest.name + '?')) return;
    const idx = guests.findIndex(function(g) { return g.id === id; });
    if (idx !== -1) guests.splice(idx, 1);
    api.save();
    refreshAll();
}

tbodyGuests.addEventListener('click', function(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const id = parseInt(button.dataset.id, 10);
    if (button.dataset.action === 'edit-guest') {
        const guest = guests.find(function(g) { return g.id === id; });
        if (guest) openGuestModal(guest);
    } else if (button.dataset.action === 'delete-guest') {
        deleteGuest(id);
    }
});

filterRoomType.addEventListener('change', function() {
    roomTypeFilter = this.value;
    renderRooms(rooms);
});

filterRoomStatus.addEventListener('change', function() {
    roomStatusFilter = this.value;
    renderRooms(rooms);
});

guestSearchInput.addEventListener('input', function() {
    guestSearchQuery = this.value.trim().toLowerCase();
    renderGuests(guests);
});

tbodyReservations.addEventListener('click', function(e) {
    const button = e.target.closest('button[data-action]');
    if (!button || button.disabled) return;
    const id = parseInt(button.dataset.id, 10);
    if (button.dataset.action === 'edit') {
        const reservation = reservations.find(function(r) { return r.id === id; });
        if (reservation) openModal(reservation);
    } else if (button.dataset.action === 'cancel') {
        cancelReservation(id);
    }
});

function renderRooms(roomsData) {
    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = '';

    const badgeMap = {
        'Wolny':        'badge--green',
        'Zajęty':       'badge--red',
        'W sprzątaniu': 'badge--yellow'
    };

    const filtered = roomsData.filter(function(room) {
        if (roomTypeFilter && room.type !== roomTypeFilter) return false;
        if (roomStatusFilter && room.status !== roomStatusFilter) return false;
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">Brak pokoi spełniających kryteria.</p>';
        return;
    }

    filtered.forEach(function(room) {
        const badgeClass = badgeMap[room.status] || 'badge--gray';
        const div = document.createElement('div');
        div.className = 'room-card';
        div.innerHTML =
            '<div class="room-number">' + room.number + '</div>' +
            '<div class="room-type">' + escapeHtml(room.type) + '</div>' +
            '<div class="room-price">' + room.price + ' zł / noc</div>' +
            '<span class="badge ' + badgeClass + '">' + escapeHtml(room.status) + '</span>' +
            '<div class="room-actions">' +
                '<button class="btn btn--small" data-action="edit-room" data-number="' + room.number + '">Edytuj</button>' +
                '<button class="btn btn--small btn--danger" data-action="delete-room" data-number="' + room.number + '">Usuń</button>' +
            '</div>';
        grid.appendChild(div);
    });
}

function renderReservations(reservationsData) {
    tbodyReservations.innerHTML = '';

    const badgeMap = {
        'Potwierdzona': 'badge--green',
        'Zakończona':   'badge--gray',
        'Anulowana':    'badge--red'
    };

    if (reservationsData.length === 0) {
        tbodyReservations.innerHTML = '<tr><td colspan="6" class="empty-state">Brak rezerwacji.</td></tr>';
        return;
    }

    const sorted = reservationsData.slice().sort(function(a, b) {
        return b.checkIn.localeCompare(a.checkIn);
    });

    sorted.forEach(function(res) {
        const badgeClass = badgeMap[res.status] || 'badge--gray';
        const editable = res.status === 'Potwierdzona';
        const disabledAttr = editable ? '' : ' disabled';
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + escapeHtml(res.guest) + '</td>' +
            '<td>' + res.room + '</td>' +
            '<td>' + res.checkIn + '</td>' +
            '<td>' + res.checkOut + '</td>' +
            '<td><span class="badge ' + badgeClass + '">' + escapeHtml(res.status) + '</span></td>' +
            '<td>' +
                '<button class="btn btn--small" data-action="edit" data-id="' + res.id + '"' + disabledAttr + '>Edytuj</button> ' +
                '<button class="btn btn--small btn--danger" data-action="cancel" data-id="' + res.id + '"' + disabledAttr + '>Anuluj</button>' +
            '</td>';
        tbodyReservations.appendChild(tr);
    });
}

function renderGuests(guestsData) {
    const tbody = document.getElementById('tbody-goscie');
    tbody.innerHTML = '';

    const filtered = guestsData.filter(function(g) {
        if (!guestSearchQuery) return true;
        return g.name.toLowerCase().indexOf(guestSearchQuery) !== -1
            || (g.phone || '').toLowerCase().indexOf(guestSearchQuery) !== -1
            || (g.email || '').toLowerCase().indexOf(guestSearchQuery) !== -1;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Brak gości.</td></tr>';
        return;
    }

    filtered.forEach(function(guest) {
        const checkedIn = reservations.some(function(r) {
            return r.guest === guest.name && isActiveToday(r);
        });
        const statusBadge = checkedIn
            ? '<span class="badge badge--green">Zameldowany</span>'
            : '<span class="badge badge--gray">Wymeldowany</span>';
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + escapeHtml(guest.name) + '</td>' +
            '<td>' + escapeHtml(guest.phone || '-') + '</td>' +
            '<td>' + escapeHtml(guest.email || '-') + '</td>' +
            '<td>' + statusBadge + '</td>' +
            '<td>' +
                '<button class="btn btn--small" data-action="edit-guest" data-id="' + guest.id + '">Edytuj</button> ' +
                '<button class="btn btn--small btn--danger" data-action="delete-guest" data-id="' + guest.id + '">Usuń</button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function updateDashboard(roomsData, reservationsData) {
    const t = today();

    const total    = roomsData.length;
    const free     = roomsData.filter(function(r) { return r.status === 'Wolny'; }).length;
    const occupied = roomsData.filter(function(r) { return r.status === 'Zajęty'; }).length;
    const cleaning = roomsData.filter(function(r) { return r.status === 'W sprzątaniu'; }).length;

    document.getElementById('stat-wszystkie').textContent = total;
    document.getElementById('stat-wolne').textContent = free;
    document.getElementById('stat-zajete').textContent = occupied;
    document.getElementById('stat-sprzatanie').textContent = cleaning;

    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
    document.getElementById('occupancy-fill').style.width = percent + '%';
    document.getElementById('occupancy-label').textContent = percent + '%';

    const arrivalsList = document.getElementById('lista-przyjazdy');
    const arrivals = reservationsData.filter(function(r) {
        return r.checkIn === t && r.status === 'Potwierdzona';
    });
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

    const departuresList = document.getElementById('lista-wyjazdy');
    const departures = reservationsData.filter(function(r) {
        return r.checkOut === t && r.status === 'Potwierdzona';
    });
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

function fillRoomSelect(roomsData, includeRoomNumber) {
    const select = document.getElementById('pokoj');
    while (select.options.length > 1) {
        select.remove(1);
    }
    const availableRooms = roomsData.filter(function(r) {
        return r.status === 'Wolny' || r.number === includeRoomNumber;
    });
    availableRooms.sort(function(a, b) { return a.number - b.number; });
    availableRooms.forEach(function(r) {
        const option = document.createElement('option');
        option.value = r.number;
        option.textContent = r.number + ' - ' + r.type;
        select.appendChild(option);
    });
}

function refreshAll() {
    renderRooms(rooms);
    renderReservations(reservations);
    renderGuests(guests);
    updateDashboard(rooms, reservations);
}

Promise.all([api.getRooms(), api.getReservations(), api.getGuests()]).then(function(results) {
    rooms = results[0];
    reservations = results[1];
    guests = results[2];
    refreshAll();
});
