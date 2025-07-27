// --- Données en mémoire (SIMULÉES - STOCKÉES LOCALEMENT VIA localStorage) ---
// Ces données seront perdues si l'utilisateur vide son cache ou utilise un autre navigateur.
// Pour une vraie application, elles doivent venir d'un backend (base de données).
let currentUser = null;
let users = [];
let bookings = [];
let services = [
    {
        id: 1,
        name: 'Lavage Auto Complet',
        priceMin: 25,
        priceMax: 40,
        description: 'Lavage extérieur et intérieur complet de votre véhicule. Option lustrage disponible.',
        imageUrl: 'https://placehold.co/80x80/667eea/ffffff/png?text=Auto', // REMPLACER PAR VOTRE URL D'IMAGE
        options: [
            { name: "Lustrage extérieur", price: 10 },
            { name: "Nettoyage des sièges", price: 15 }
        ]
    },
    {
        id: 2,
        name: 'Nettoyage de Tapis',
        priceMin: 30,
        priceMax: 60,
        description: 'Nettoyage en profondeur de vos tapis, avec traitement anti-taches si nécessaire.',
        imageUrl: 'https://placehold.co/80x80/764ba2/ffffff/png?text=Tapis', // REMPLACER PAR VOTRE URL D'IMAGE
        options: [
            { name: "Traitement anti-allergènes", price: 10 },
            { name: "Désodorisation", price: 5 }
        ]
    },
    {
        id: 3,
        name: 'Jardinage Basic',
        priceMin: 40,
        priceMax: 80,
        description: 'Tonte de pelouse, désherbage et taille légère des arbustes.',
        imageUrl: 'https://placehold.co/80x80/f093fb/ffffff/png?text=Jardin', // REMPLACER PAR VOTRE URL D'IMAGE
        options: [
            { name: "Évacuation des déchets verts", price: 15 },
            { name: "Taille de haies", price: 25 }
        ]
    },
    {
        id: 4,
        name: 'Bricolage Léger',
        priceMin: 20,
        priceMax: 50,
        description: 'Petites réparations, montage de meubles, fixation d\'étagères.',
        imageUrl: 'https://placehold.co/80x80/10b981/ffffff/png?text=Brico', // REMPLACER PAR VOTRE URL D'IMAGE
        options: [
            { name: "Fourniture de petites pièces", price: 10 }
        ]
    }
];

// --- Fonctions Utilitaires ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-links a[onclick*="showPage('${pageId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Logic for dynamic content display when page changes
    if (pageId === 'services') {
        renderServices(document.getElementById('all-services'));
    } else if (pageId === 'booking') {
        populateServiceSelect();
        document.getElementById('booking-form').reset();
        document.getElementById('service-options-section').classList.add('hidden');
        document.getElementById('base-service-price').textContent = '0€';
        document.getElementById('total-estimated-price').textContent = '0€';
        document.getElementById('delivery-cost').textContent = '0€';
        populateBookingTimes(); // Populate times when booking page is shown
    } else if (pageId === 'profile') {
        updateProfileView();
        renderUserBookings();
        renderUserMessages();
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// --- Authentification (SIMULÉE - via localStorage) ---
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const logoutLink = document.getElementById('logout-link');

function updateAuthLinks() {
    if (currentUser) {
        authLink.classList.add('hidden');
        profileLink.classList.remove('hidden');
        logoutLink.classList.remove('hidden');
    } else {
        authLink.classList.remove('hidden');
        profileLink.classList.add('hidden');
        logoutLink.classList.add('hidden');
    }
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        showNotification(`Bienvenue, ${currentUser.name}! (Connexion simulée)`, 'success');
        updateAuthLinks();
        showPage('home');
    } else {
        showNotification('Email ou mot de passe incorrect (Simulation).', 'error');
    }
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;

    if (password !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas.', 'error');
        return;
    }
    if (users.some(u => u.email === email)) {
        showNotification('Cet email est déjà enregistré (Simulation).', 'error');
        return;
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        phone,
        password, // En production: JAMAIS stocker les mots de passe en clair!
        messages: []
    };
    users.push(newUser);
    currentUser = newUser;
    saveData(); // Save to localStorage
    showNotification('Compte créé avec succès ! (Simulation)', 'success');
    updateAuthLinks();
    showPage('home');
});

function logout() {
    currentUser = null;
    saveData(); // Save to localStorage
    showNotification('Déconnexion réussie (Simulation).', 'info');
    updateAuthLinks();
    showPage('home');
}

// --- Affichage des Services ---
function renderServices(targetElement) {
    targetElement.innerHTML = '';
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.classList.add('service-card');
        serviceCard.innerHTML = `
            <img src="${service.imageUrl}" alt="${service.name}" class="service-image">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <p class="price">${service.priceMin}€${service.priceMax ? ' - ' + service.priceMax + '€' : ''}</p>
            <button class="btn" onclick="prefillBooking(${service.id})">Réserver</button>
        `;
        targetElement.appendChild(serviceCard);
    });
}

function prefillBooking(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        showPage('booking');
        document.getElementById('service-select').value = serviceId;
        updateBookingOptions();
    }
}

// --- Logique de Réservation (SIMULÉE) ---
function populateServiceSelect() {
    const serviceSelect = document.getElementById('service-select');
    serviceSelect.innerHTML = '<option value="">Sélectionner un service</option>';
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
    });
}

function updateBookingOptions() {
    const serviceSelect = document.getElementById('service-select');
    const selectedServiceId = parseInt(serviceSelect.value);
    const serviceOptionsSection = document.getElementById('service-options-section');
    const serviceOptionsContent = document.getElementById('service-options-content');
    const baseServicePriceSpan = document.getElementById('base-service-price');

    serviceOptionsContent.innerHTML = '';
    baseServicePriceSpan.textContent = '0€';
    serviceOptionsSection.classList.add('hidden');

    const selectedService = services.find(s => s.id === selectedServiceId);

    if (selectedService && selectedService.options && selectedService.options.length > 0) {
        serviceOptionsSection.classList.remove('hidden');
        selectedService.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('form-group');
            optionDiv.innerHTML = `
                <label>
                    <input type="checkbox" name="serviceOption" value="${option.name}" data-price="${option.price}" onchange="calculateTotalEstimatedPrice()">
                    ${option.name} (+${option.price}€)
                </label>
            `;
            serviceOptionsContent.appendChild(optionDiv);
        });
    }
    if (selectedService) {
        baseServicePriceSpan.textContent = `${selectedService.priceMin}€`;
    }
    calculateTotalEstimatedPrice();
}

function calculateDeliveryCost() {
    const cityInput = document.getElementById('booking-city').value.toLowerCase();
    let cost = 0;
    // Simulate different delivery costs based on city
    if (cityInput.includes('paris')) {
        cost = 15;
    } else if (cityInput.includes('lyon')) {
        cost = 10;
    } else if (cityInput.includes('marseille')) {
        cost = 12;
    } else if (cityInput.length > 0) { // Any other typed city implies a standard cost
        cost = 5;
    }
    document.getElementById('delivery-cost').textContent = `${cost}€`;
    calculateTotalEstimatedPrice();
}

function calculateTotalEstimatedPrice() {
    const serviceSelect = document.getElementById('service-select');
    const selectedServiceId = parseInt(serviceSelect.value);
    const selectedService = services.find(s => s.id === selectedServiceId);

    let basePrice = selectedService ? selectedService.priceMin : 0;
    let optionsPrice = 0;
    document.querySelectorAll('input[name="serviceOption"]:checked').forEach(checkbox => {
        optionsPrice += parseFloat(checkbox.dataset.price);
    });

    const deliveryCost = parseFloat(document.getElementById('delivery-cost').textContent.replace('€', ''));

    const total = basePrice + optionsPrice + deliveryCost;
    document.getElementById('total-estimated-price').textContent = `${total}€`;
}

function populateBookingTimes() {
    const timeSelect = document.getElementById('booking-time');
    timeSelect.innerHTML = '<option value="">Sélectionner une heure</option>';
    // Example: Times from 9:00 to 18:00 every hour
    for (let i = 9; i <= 18; i++) {
        const hour = i < 10 ? '0' + i : i;
        const option = document.createElement('option');
        option.value = `${hour}:00`;
        option.textContent = `${hour}:00`;
        timeSelect.appendChild(option);
    }
}


document.getElementById('booking-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!currentUser) {
        showNotification('Veuillez vous connecter pour faire une réservation.', 'error');
        showPage('login');
        return;
    }

    const serviceId = document.getElementById('service-select').value;
    const bookingDate = document.getElementById('booking-date').value;
    const bookingTime = document.getElementById('booking-time').value;
    const bookingAddress = document.getElementById('booking-address').value;
    const bookingCity = document.getElementById('booking-city').value;
    const bookingNotes = document.getElementById('booking-notes').value;

    const selectedService = services.find(s => s.id === parseInt(serviceId));
    const serviceName = selectedService ? selectedService.name : 'Service Inconnu';
    const estimatedPrice = document.getElementById('total-estimated-price').textContent;

    const newBooking = {
        id: bookings.length + 1,
        userId: currentUser.id,
        service: serviceName,
        date: bookingDate,
        time: bookingTime,
        address: bookingAddress,
        city: bookingCity,
        notes: bookingNotes,
        price: estimatedPrice,
        status: 'En attente'
    };

    bookings.push(newBooking);
    saveData(); // Save to localStorage
    showNotification('Réservation confirmée ! (Simulation)', 'success');
    document.getElementById('booking-form').reset();
    showPage('profile'); // Show user their new booking
});

// --- Gestion du Profil Utilisateur (SIMULÉE) ---
function updateProfileView() {
    if (currentUser) {
        document.getElementById('profile-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
    }
}

function renderUserBookings() {
    const userBookingsContainer = document.getElementById('user-bookings');
    userBookingsContainer.innerHTML = '';

    if (!currentUser) {
        userBookingsContainer.innerHTML = '<p>Veuillez vous connecter pour voir vos réservations.</p>';
        return;
    }

    const userSpecificBookings = bookings.filter(b => b.userId === currentUser.id);

    if (userSpecificBookings.length === 0) {
        userBookingsContainer.innerHTML = '<p>Vous n\'avez pas encore de réservations.</p>';
        return;
    }

    userSpecificBookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.classList.add('booking-item');
        bookingItem.innerHTML = `
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Date & Heure:</strong> ${booking.date} à ${booking.time}</p>
            <p><strong>Adresse:</strong> ${booking.address}, ${booking.city}</p>
            <p><strong>Prix Estimé:</strong> ${booking.price}</p>
            <p><strong>Statut:</strong> ${booking.status}</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        `;
        userBookingsContainer.appendChild(bookingItem);
    });
}

function renderUserMessages() {
    const userMessagesContainer = document.getElementById('user-messages');
    userMessagesContainer.innerHTML = '';

    if (!currentUser) {
        userMessagesContainer.innerHTML = '<p>Veuillez vous connecter pour voir vos messages.</p>';
        return;
    }

    if (currentUser.messages.length === 0) {
        userMessagesContainer.innerHTML = '<p>Vous n\'avez pas encore de messages.</p>';
        return;
    }

    currentUser.messages.forEach(msg => {
        const messageItem = document.createElement('div');
        messageItem.classList.add('message-item', msg.sender === 'user' ? 'sent' : 'received');
        messageItem.innerHTML = `
            <p>${msg.content}</p>
            <small>${msg.timestamp} - ${msg.sender === 'user' ? 'Moi' : 'Support'}</small>
        `;
        userMessagesContainer.appendChild(messageItem);
    });
    userMessagesContainer.scrollTop = userMessagesContainer.scrollHeight; // Scroll to bottom
}

document.getElementById('send-message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        showNotification('Veuillez vous connecter pour envoyer un message.', 'error');
        showPage('login');
        return;
    }

    const messageInput = document.getElementById('message-input');
    const messageContent = messageInput.value.trim();

    if (messageContent) {
        const now = new Date();
        const timestamp = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
        currentUser.messages.push({
            content: messageContent,
            sender: 'user',
            timestamp: timestamp
        });
        saveData();
        renderUserMessages();
        messageInput.value = '';
        showNotification('Message envoyé ! (Simulation)', 'success');

        // Simulate a support reply
        setTimeout(() => {
            currentUser.messages.push({
                content: "Merci pour votre message ! Nous vous répondrons dans les plus brefs délais. (Réponse simulée)",
                sender: 'support',
                timestamp: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR')
            });
            saveData();
            renderUserMessages();
        }, 2000);
    } else {
        showNotification('Le message ne peut pas être vide.', 'warning');
    }
});


// --- Contact Form (SIMULÉ) ---
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;

    console.log('Contact form submitted (simulated):', { name, email, subject, message });
    showNotification('Votre message a été envoyé ! (Simulation)', 'success');
    document.getElementById('contact-form').reset();
});

// --- Persistence with localStorage ---
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Store current user state
}

function loadData() {
    const storedUsers = localStorage.getItem('users');
    const storedBookings = localStorage.getItem('bookings');
    const storedCurrentUser = localStorage.getItem('currentUser');

    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
    if (storedBookings) {
        bookings = JSON.parse(storedBookings);
    }
    if (storedCurrentUser) {
        currentUser = JSON.parse(storedCurrentUser);
    }
}

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    loadData(); // Load data when the page loads
    updateAuthLinks(); // Update auth links based on loaded currentUser
    renderServices(document.getElementById('home-services')); // Render services on home page
    populateBookingTimes(); // Ensure times are populated on booking page load
});