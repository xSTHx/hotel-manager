const mockData = {
    rooms: [
        { number: 101, type: 'Jednoosobowy', price: 150, status: 'Wolny' },
        { number: 102, type: 'Dwuosobowy',   price: 220, status: 'Zajęty' },
        { number: 103, type: 'Apartament',   price: 450, status: 'W sprzątaniu' },
        { number: 104, type: 'Jednoosobowy', price: 150, status: 'Wolny' },
        { number: 105, type: 'Dwuosobowy',   price: 220, status: 'Zajęty' },
        { number: 106, type: 'Dwuosobowy',   price: 220, status: 'Wolny' },
        { number: 201, type: 'Jednoosobowy', price: 150, status: 'Wolny' },
        { number: 202, type: 'Dwuosobowy',   price: 220, status: 'Zajęty' },
        { number: 203, type: 'Dwuosobowy',   price: 220, status: 'Wolny' },
        { number: 204, type: 'Jednoosobowy', price: 150, status: 'Wolny' },
        { number: 205, type: 'Apartament',   price: 480, status: 'Zajęty' },
        { number: 206, type: 'Dwuosobowy',   price: 220, status: 'Wolny' }
    ],
    reservations: [
        { id: 1, guest: 'Jan Kowalski',       room: 101, checkIn: '2026-03-29', checkOut: '2026-04-01', status: 'Potwierdzona' },
        { id: 2, guest: 'Anna Nowak',          room: 205, checkIn: '2026-03-29', checkOut: '2026-04-03', status: 'Potwierdzona' },
        { id: 3, guest: 'Piotr Wiśniewski',   room: 103, checkIn: '2026-03-25', checkOut: '2026-03-29', status: 'Zakończona' },
        { id: 4, guest: 'Marek Zieliński',    room: 102, checkIn: '2026-03-20', checkOut: '2026-04-05', status: 'Potwierdzona' },
        { id: 5, guest: 'Katarzyna Wójcik',   room: 105, checkIn: '2026-03-22', checkOut: '2026-04-02', status: 'Potwierdzona' },
        { id: 6, guest: 'Tomasz Lewandowski', room: 202, checkIn: '2026-03-28', checkOut: '2026-04-01', status: 'Potwierdzona' }
    ],
    guests: [
        { id: 1, name: 'Jan Kowalski',       phone: '+48 600 100 200', email: 'jan.kowalski@email.com' },
        { id: 2, name: 'Anna Nowak',          phone: '+48 700 200 300', email: 'anna.nowak@email.com' },
        { id: 3, name: 'Piotr Wiśniewski',   phone: '+48 500 300 400', email: 'piotr.w@email.com' },
        { id: 4, name: 'Marek Zieliński',    phone: '+48 501 234 567', email: 'marek.zielinski@email.com' },
        { id: 5, name: 'Katarzyna Wójcik',   phone: '+48 601 345 678', email: 'k.wojcik@email.com' },
        { id: 6, name: 'Tomasz Lewandowski', phone: '+48 502 456 789', email: 't.lewandowski@email.com' }
    ]
};

const STORAGE_KEY = 'hotelManagerData';

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.rooms || !parsed.reservations || !parsed.guests) return null;
        return parsed;
    } catch (e) {
        return null;
    }
}

function cloneMockData() {
    return JSON.parse(JSON.stringify(mockData));
}

const data = loadFromStorage() || cloneMockData();

const api = {
    getRooms: function() {
        return Promise.resolve(data.rooms);
    },
    getReservations: function() {
        return Promise.resolve(data.reservations);
    },
    getGuests: function() {
        return Promise.resolve(data.guests);
    },
    getCurrencyRates: function() {
        return fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Błąd pobierania kursów (HTTP ' + response.status + ').');
                }
                return response.json();
            })
            .then(function(payload) {
                const table = payload[0];
                const wanted = ['EUR', 'USD', 'CHF'];
                const rates = {};
                table.rates.forEach(function(r) {
                    if (wanted.indexOf(r.code) !== -1) {
                        rates[r.code] = r.mid;
                    }
                });
                return { date: table.effectiveDate, rates: rates };
            });
    },
    save: function() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Nie udało się zapisać danych.', e);
        }
    },
    reset: function() {
        localStorage.removeItem(STORAGE_KEY);
        const fresh = cloneMockData();
        data.rooms.splice(0, data.rooms.length);
        Array.prototype.push.apply(data.rooms, fresh.rooms);
        data.reservations.splice(0, data.reservations.length);
        Array.prototype.push.apply(data.reservations, fresh.reservations);
        data.guests.splice(0, data.guests.length);
        Array.prototype.push.apply(data.guests, fresh.guests);
    }
};
