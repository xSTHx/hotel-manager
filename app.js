// ===== NAWIGACJA MIĘDZY WIDOKAMI =====

const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');

function pokazWidok(nazwaWidoku) {
    views.forEach(function(view) {
        view.classList.remove('active');
    });

    navLinks.forEach(function(link) {
        link.classList.remove('active');
    });

    document.getElementById('view-' + nazwaWidoku).classList.add('active');

    navLinks.forEach(function(link) {
        if (link.dataset.view === nazwaWidoku) {
            link.classList.add('active');
        }
    });
}

navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        pokazWidok(this.dataset.view);

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

const modalRezerwacja = document.getElementById('modalRezerwacja');
const btnNowaRezerwacja = document.getElementById('btnNowaRezerwacja');
const btnZamknijModal = document.getElementById('btnZamknijModal');
const btnAnulujForm = document.getElementById('btnAnulujForm');

btnNowaRezerwacja.addEventListener('click', function() {
    modalRezerwacja.classList.remove('hidden');
});

btnZamknijModal.addEventListener('click', function() {
    modalRezerwacja.classList.add('hidden');
});

btnAnulujForm.addEventListener('click', function() {
    modalRezerwacja.classList.add('hidden');
});

// zamknij modal po kliknięciu w tło
modalRezerwacja.addEventListener('click', function(e) {
    if (e.target === modalRezerwacja) {
        modalRezerwacja.classList.add('hidden');
    }
});


// ===== FORMULARZ: WALIDACJA =====

const formRezerwacja = document.getElementById('formRezerwacja');

formRezerwacja.addEventListener('submit', function(e) {
    e.preventDefault();

    const gosc = document.getElementById('gosc').value.trim();
    const pokoj = document.getElementById('pokoj').value;
    const przyjazd = document.getElementById('przyjazd').value;
    const wyjazd = document.getElementById('wyjazd').value;

    if (!gosc || !pokoj || !przyjazd || !wyjazd) {
        alert('Wypełnij wszystkie pola.');
        return;
    }

    if (wyjazd <= przyjazd) {
        alert('Data wyjazdu musi być późniejsza niż data przyjazdu.');
        return;
    }

    alert('Rezerwacja dodana! (dane statyczne - etap 1)');
    modalRezerwacja.classList.add('hidden');
    formRezerwacja.reset();
});
