// ===== MOCK DANE =====

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


// ===== MOCK API =====

const api = {
    getRooms: function() {
        return Promise.resolve(mockData.rooms);
    },
    getReservations: function() {
        return Promise.resolve(mockData.reservations);
    },
    getGuests: function() {
        return Promise.resolve(mockData.guests);
    }
};
