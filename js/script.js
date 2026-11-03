// ===== MOBILE HAMBURGER MENU =====
let availableAttractions = [];

document.addEventListener('DOMContentLoaded', function() {
    // Filter buttons - event listeners
    const filterButtons = document.getElementById('filterButtons');
    if (filterButtons) {
        filterButtons.addEventListener('click', event => {
            const button = event.target.closest('.filter-btn');
            if (!button) return;
            filterButtons.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            filterSpots();
        });
    }

    // Search input - event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterSpots);
    }
    const districtFilter = document.getElementById('districtFilter');
    if (districtFilter) {
        districtFilter.addEventListener('change', () => {
            if (window.location.pathname.toLowerCase().endsWith('attractions.html')) {
                filterSpots();
                return;
            }
            if (districtFilter.value === 'sylhet') {
                window.location.href = 'sylhet.html';
                return;
            }
            if (districtFilter.value === 'sunamganj') {
                window.location.href = 'sunamganj.html';
                return;
            }
            if (districtFilter.value === 'habiganj') {
                window.location.href = 'habiganj.html';
                return;
            }
            if (districtFilter.value === 'moulvibazar') {
                window.location.href = 'moulvibazar.html';
                return;
            }
            filterSpots();
        });
    }

    // Initial filter
    filterSpots();
    loadAttractions();
    handleMissingImages();
    startHeroSlideshow();
    setupActionModal();
});

function startHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    let activeIndex = 0;
    window.setInterval(() => {
        slides[activeIndex].classList.remove('active');
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add('active');
    }, 5000);
}

const categoryDisplay = {
    'tea-garden': { label: 'Tea Garden', icon: 'fa-mug-hot', emoji: '🍃' },
    park: { label: 'Park', icon: 'fa-tree', emoji: '🌳' },
    sea: { label: 'Sea', icon: 'fa-water', emoji: '🌊' },
    mountain: { label: 'Mountain', icon: 'fa-mountain', emoji: '⛰️' },
    zoo: { label: 'Zoo', icon: 'fa-paw', emoji: '🐘' },
    jungle: { label: 'Jungle', icon: 'fa-tree', emoji: '🌿' },
    museum: { label: 'Heritage', icon: 'fa-landmark', emoji: '🏛️' },
    heritage: { label: 'Heritage', icon: 'fa-landmark', emoji: '🏛️' },
    historical: { label: 'Historical', icon: 'fa-landmark', emoji: '🏛️' },
    culture: { label: 'Culture', icon: 'fa-people-group', emoji: '🎭' },
    island: { label: 'Island', icon: 'fa-umbrella-beach', emoji: '🏝️' },
    river: { label: 'River', icon: 'fa-water', emoji: '🛶' },
    lake: { label: 'Lake', icon: 'fa-water', emoji: '💧' },
    waterfall: { label: 'Waterfall', icon: 'fa-water', emoji: '💧' },
    resort: { label: 'Resort', icon: 'fa-hotel', emoji: '🏡' },
    religious: { label: 'Religious Place', icon: 'fa-place-of-worship', emoji: '🕌' },
    swamp: { label: 'Wetland', icon: 'fa-leaf', emoji: '🌾' }
};

const attractionSlugs = {
    jaflong: 'jaflong',
    bichnakandi: 'bichnakandi',
    'ratargul swamp forest': 'ratargul',
    lalakhal: 'lalakhal',
    'tanguar haor': 'tanguar-haor',
    'sreemangal tea gardens': 'sreemangal',
    'hazrat shahjalal shrine': 'shahjalal',
    'hazrat shahparan shrine': 'shahparan',
    "ali amjad's clock": 'ali-amjad'
};

const searchAliases = {
    'জাফলং': 'jaflong',
    'বিছনাকান্দি': 'bichnakandi',
    'রাতারগুল': 'ratargul',
    'লালাখাল': 'lalakhal',
    'টাঙ্গুয়ার হাওর': 'tanguar haor',
    'টাঙ্গুয়ার হাওর': 'tanguar haor',
    'শ্রীমঙ্গল': 'sreemangal'
};

const districtSearchAliases = {
    'sylhet': 'sylhet',
    'সিলেট': 'sylhet',
    'sunamganj': 'sunamganj',
    'sunam ganj': 'sunamganj',
    'সুনামগঞ্জ': 'sunamganj',
    'habiganj': 'habiganj',
    'hobiganj': 'habiganj',
    'habigong': 'habiganj',
    'হবিগঞ্জ': 'habiganj',
    'moulvibazar': 'moulvibazar',
    'moulvi bazar': 'moulvibazar',
    'moulovi bazar': 'moulvibazar',
    'moulvi-bazar': 'moulvibazar',
    'moulovi-bazar': 'moulvibazar',
    'moulobazar': 'moulvibazar',
    'মৌলভীবাজার': 'moulvibazar'
};

const curatedDistrictPlaces = [
    { name: 'Tanguar Haor', district: 'sunamganj', location: 'Sunamganj', category: 'swamp' },
    { name: 'Narayantala', district: 'sunamganj', location: 'Sunamganj', category: 'mountain' },
    { name: 'Pagla Boro Jame Mosque', district: 'sunamganj', location: 'Sunamganj', category: 'religious' },
    { name: 'Lalghat Waterfall', district: 'sunamganj', location: 'Tahirpur, Sunamganj', category: 'waterfall' },
    { name: 'Hason Raja Museum', district: 'sunamganj', location: 'Sunamganj', category: 'museum' },
    { name: 'Barek Tila', district: 'sunamganj', location: 'Tahirpur, Sunamganj', category: 'mountain' },
    { name: 'Jadukata River', district: 'sunamganj', location: 'Sunamganj', category: 'river' },
    { name: 'Shimul Bagan', district: 'sunamganj', location: 'Tahirpur, Sunamganj', category: 'park' },
    { name: 'Niladri Lake', district: 'sunamganj', location: 'Tekerghat, Sunamganj', category: 'lake' },
    { name: 'Rema-Kalenga Wildlife Sanctuary', district: 'habiganj', location: 'Chunarughat, Habiganj', category: 'jungle' },
    { name: 'Polo Bawa Festival', district: 'habiganj', location: 'Habiganj', category: 'culture' },
    { name: 'Sankarpasha Shahi Mosque', district: 'habiganj', location: 'Rajura, Habiganj', category: 'religious' },
    { name: 'Bithangal Bara Akhara', district: 'habiganj', location: 'Baniachong, Habiganj', category: 'heritage' },
    { name: 'Greenland Park', district: 'habiganj', location: 'Chunarughat, Habiganj', category: 'park' },
    { name: 'The Palace Luxury Resort', district: 'habiganj', location: 'Bahubal, Habiganj', category: 'resort' },
    { name: 'Satchari National Park', district: 'habiganj', location: 'Chunarughat, Habiganj', category: 'jungle' },
    { name: 'Sreemangal Tea Gardens', district: 'moulvibazar', location: 'Moulvibazar', category: 'tea-garden' },
    { name: 'Lawachara National Park', district: 'moulvibazar', location: 'Kamalganj, Moulvibazar', category: 'jungle' },
    { name: 'Baikka Beel', district: 'moulvibazar', location: 'Sreemangal, Moulvibazar', category: 'swamp' },
    { name: 'Camellia Lake', district: 'moulvibazar', location: 'Kamalganj, Moulvibazar', category: 'lake' },
    { name: 'Bird Park and Eco Village', district: 'moulvibazar', location: 'Moulvibazar', category: 'park' },
    { name: 'Bilashchora Lake', district: 'moulvibazar', location: 'Sreemangal, Moulvibazar', category: 'lake' },
    { name: 'Tipra Cherra Golf Course', district: 'moulvibazar', location: 'Sreemangal, Moulvibazar', category: 'park' },
    { name: 'Hail Haor', district: 'moulvibazar', location: 'Moulvibazar', category: 'swamp' },
    { name: 'Patharia Hill', district: 'moulvibazar', location: 'Barlekha, Moulvibazar', category: 'mountain' },
    { name: 'Parikunda Waterfall', district: 'moulvibazar', location: 'Barlekha, Moulvibazar', category: 'waterfall' },
    { name: 'Adampur Forest', district: 'moulvibazar', location: 'Kamalganj, Moulvibazar', category: 'jungle' },
    { name: 'Darjeeling Hill', district: 'moulvibazar', location: 'Sreemangal, Moulvibazar', category: 'mountain' },
    { name: 'Bir Shrestho Hamidur Rahman Memorial', district: 'moulvibazar', location: 'Dhalai, Moulvibazar', category: 'historical' },
    { name: 'Kala Pahar', district: 'moulvibazar', location: 'Kulaura, Moulvibazar', category: 'mountain' }
];

const homeFeaturedNames = new Set([
    'jaflong',
    'bichnakandi',
    'ratargul swamp forest',
    'tanguar haor',
    'sreemangal tea gardens',
    'lawachara national park'
]);

const districtFallbackImages = {
    sylhet: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Jaflong_by_Muhammad_Nazmul_Hasan_1.jpg',
    sunamganj: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Selling_snacks_in_Tanguar_Haor.jpg',
    habiganj: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Rema_Kalenga_Wildlife_Sanctuary.jpg',
    moulvibazar: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Tea_Gardens_of_Sreemangal_01.jpg'
};

function normalizeSearchText(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g, ' ');
}

function getAttractionDistrict(location) {
    const normalizedLocation = normalizeSearchText(location);
    if (/(^|[^a-z])sunam\s*ganj([^a-z]|$)|সুনামগঞ্জ/.test(normalizedLocation)) return 'sunamganj';
    if (/(^|[^a-z])habiganj([^a-z]|$)|(^|[^a-z])hobiganj([^a-z]|$)|হবিগঞ্জ/.test(normalizedLocation)) return 'habiganj';
    if (/(^|[^a-z])moulvi\s*bazar([^a-z]|$)|(^|[^a-z])moulobazar([^a-z]|$)|মৌলভীবাজার/.test(normalizedLocation)) return 'moulvibazar';
    return 'sylhet';
}

async function loadAttractions() {
    const grids = [
        document.getElementById('spotGrid'),
        document.getElementById('attractionsGrid')
    ].filter(Boolean);
    if (!grids.length) return;

    grids.forEach(grid => {
        grid.replaceChildren(createStatusMessage('Loading destinations...'));
    });
    const loadStatus = document.getElementById('attractionsLoadStatus');
    if (loadStatus) {
        loadStatus.hidden = true;
        loadStatus.textContent = '';
    }

    try {
        const response = await fetch('/api/attractions');
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unable to load destinations.');
        }
        if (!Array.isArray(data.attractions)) {
            throw new Error('The destination service returned an invalid response.');
        }
        availableAttractions = data.attractions;
        grids.forEach(grid => {
            const usedSlugs = new Set();
            const attractions = [...availableAttractions];
            const knownNames = new Set(availableAttractions.map(item => normalizeSearchText(item.name)));
            curatedDistrictPlaces.forEach(place => {
                if (!knownNames.has(normalizeSearchText(place.name))) {
                    attractions.push({
                        ...place,
                        description: `Explore ${place.name} and visitor information on the ${place.district} district guide.`,
                        districtPage: `${place.district}.html`
                    });
                }
            });
            grid.replaceChildren(...attractions.map(item => createAttractionCard(item, grid.id, usedSlugs)));
        });
        const directoryAttractions = [...availableAttractions];
        const knownNames = new Set(availableAttractions.map(item => normalizeSearchText(item.name)));
        curatedDistrictPlaces.forEach(place => {
            if (!knownNames.has(normalizeSearchText(place.name))) {
                directoryAttractions.push({ ...place, districtPage: `${place.district}.html` });
            }
        });
        renderCategoryFilters(directoryAttractions);
        updateBookingAttractions();
        if (loadStatus) loadStatus.hidden = true;
        filterSpots();
    } catch (error) {
        grids.forEach(grid => {
            grid.replaceChildren(createStatusMessage('Destinations could not be loaded. Please try again later.'));
        });
        if (loadStatus) {
            loadStatus.textContent = error.message;
            loadStatus.hidden = false;
        }
        const countElement = document.getElementById('countNumber');
        if (countElement) countElement.textContent = '0';
    }
}

function createStatusMessage(message) {
    const status = document.createElement('p');
    status.className = 'search-empty-state';
    status.setAttribute('role', 'status');
    status.textContent = message;
    return status;
}

function normalizeCategory(category) {
    return String(category || '').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'other';
}

function createAttractionCard(attraction, gridId, usedSlugs) {
    const id = Number.isSafeInteger(Number(attraction.id)) ? Number(attraction.id) : null;
    const name = String(attraction.name || 'Sylhet destination');
    const category = normalizeCategory(attraction.category);
    const display = categoryDisplay[category] || {
        label: attraction.districtPage ? 'District highlight' : String(attraction.category || 'Other'),
        icon: 'fa-location-dot',
        emoji: '📍'
    };
    let slug = attractionSlugs[name.trim().toLowerCase()]
        || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        || `attraction-${id || normalizeSearchText(name).replace(/\s+/g, '-')}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${id || usedSlugs.size}`;
    usedSlugs.add(slug);

    const card = document.createElement('article');
    card.className = 'place-card';
    card.id = slug;
    card.dataset.category = category;
    if (id !== null) card.dataset.attractionId = String(id);
    card.dataset.district = attraction.district || getAttractionDistrict(attraction.location);
    card.dataset.featured = homeFeaturedNames.has(normalizeSearchText(name)) ? 'true' : 'false';
    card.dataset.search = normalizeSearchText([
        name,
        attraction.category,
        display.label,
        attraction.location,
        attraction.description
    ].join(' '));

    const image = document.createElement('img');
    image.src = getSafeImageUrl(attraction.image_url || districtFallbackImages[card.dataset.district]);
    image.alt = name;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
        image.src = 'images/hero-sylhet.svg';
    }, { once: true });
    card.appendChild(image);

    const content = document.createElement('div');
    content.className = 'card-content';

    const icon = document.createElement('div');
    icon.className = 'card-icon';
    const iconElement = document.createElement('i');
    iconElement.className = `fas ${display.icon}`;
    icon.appendChild(iconElement);
    content.appendChild(icon);

    const title = document.createElement('h3');
    title.textContent = name;
    content.appendChild(title);

    const categoryLabel = document.createElement('div');
    categoryLabel.className = 'sub-cat';
    categoryLabel.textContent = `${display.emoji} ${display.label}`;
    content.appendChild(categoryLabel);

    const location = document.createElement('div');
    location.className = 'location';
    const locationIcon = document.createElement('i');
    locationIcon.className = 'fas fa-location-dot';
    location.append(locationIcon, document.createTextNode(` ${String(attraction.location || '')}`));
    content.appendChild(location);

    const description = document.createElement('p');
    description.textContent = String(attraction.description || '');
    content.appendChild(description);

    const link = document.createElement('a');
    link.className = 'card-link';
    if (attraction.districtPage) {
        link.href = attraction.districtPage;
        link.append(document.createTextNode('Explore district '));
        const arrow = document.createElement('i');
        arrow.className = 'fas fa-arrow-right';
        link.appendChild(arrow);
    } else {
        link.href = `attraction.html?id=${encodeURIComponent(id)}`;
        link.append(document.createTextNode('Details '));
        const arrow = document.createElement('i');
        arrow.className = 'fas fa-arrow-right';
        link.appendChild(arrow);
    }
    content.appendChild(link);
    card.appendChild(content);
    return card;
}

function getSafeImageUrl(imageUrl) {
    if (!imageUrl) return 'images/hero-sylhet.svg';
    try {
        const url = new URL(imageUrl, window.location.origin);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            return url.href;
        }
    } catch (error) {
        return 'images/hero-sylhet.svg';
    }
    return 'images/hero-sylhet.svg';
}

function renderCategoryFilters(attractions) {
    const container = document.getElementById('filterButtons');
    if (!container) return;
    const categories = [...new Map(attractions.map(item => {
        const value = normalizeCategory(item.category);
        const display = categoryDisplay[value] || {
            label: String(item.category || 'Other'),
            icon: 'fa-location-dot',
            emoji: '📍'
        };
        return [value, display];
    })).entries()];
    const buttons = [createFilterButton('all', 'All', '')];
    categories.forEach(([value, display]) => {
        buttons.push(createFilterButton(value, display.label, display.emoji));
    });
    container.replaceChildren(...buttons);
}

function createFilterButton(category, label, emoji) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-btn${category === 'all' ? ' active' : ''}`;
    button.dataset.filter = category;
    button.textContent = emoji ? `${emoji} ${label}` : label;
    return button;
}

function updateBookingAttractions() {
    const select = document.getElementById('bookingAttraction');
    if (!select) return;
    const options = availableAttractions.map(item => {
        const option = document.createElement('option');
        option.value = String(item.id);
        option.textContent = `${item.name} — ${item.location}`;
        return option;
    });
    if (!options.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No destinations available';
        options.push(option);
    }
    select.replaceChildren(...options);
}

function handleMissingImages() {
    document.querySelectorAll('img').forEach(image => {
        const useFallback = function() {
            if (this.src.startsWith('data:image/svg+xml')) {
                return;
            }
            const label = this.alt || 'Sylhet destination';
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><rect width="1200" height="700" fill="%230a2e42"/><circle cx="920" cy="130" r="90" fill="%23fbbf24" opacity=".9"/><path d="M0 560 280 300 480 470 700 220 1200 560V700H0Z" fill="%231a4a62"/><text x="600" y="625" fill="white" font-family="Arial,sans-serif" font-size="42" text-anchor="middle">${label}</text></svg>`;
            this.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
            this.removeAttribute('srcset');
        };
        image.addEventListener('error', useFallback, { once: true });
        if (image.complete && image.naturalWidth === 0) {
            useFallback.call(image);
        }
    });
}

function setupActionModal() {
    const modal = document.createElement('div');
    modal.className = 'action-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="action-modal-backdrop" data-modal-close></div>
        <section class="action-modal-panel" role="dialog" aria-modal="true" aria-labelledby="actionModalTitle">
            <button class="action-modal-close" type="button" aria-label="Close form" data-modal-close>&times;</button>
            <h2 id="actionModalTitle">Request a travel service</h2>
            <p class="action-modal-intro">Choose a destination and tell us how we can help.</p>
            <div id="authRequired" class="auth-required" hidden>
                <p>You need to log in before sending a booking request.</p>
                <a class="btn-primary" href="login.html">Log in to continue <i class="fas fa-right-to-bracket"></i></a>
            </div>
            <form id="actionForm" hidden>
                <label for="bookingAttraction">Destination</label>
                <select id="bookingAttraction" name="attraction_id" required>
                    <option value="">Loading destinations...</option>
                </select>
                <label for="requestType">Service</label>
                <select id="requestType" name="request_type" required>
                    <option value="trip">Trip planning</option>
                    <option value="guide">Local guide</option>
                    <option value="hotel">Hotel or stay</option>
                </select>
                <label for="requestDetails">Details</label>
                <textarea id="requestDetails" name="details" rows="4" placeholder="Preferred dates, group size, and any special requests..." required></textarea>
                <button class="btn-primary" id="bookingSubmit" type="submit">Send request <i class="fas fa-paper-plane"></i></button>
                <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
            </form>
        </section>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-booking-type]');
        if (!trigger) return;
        event.preventDefault();
        const isAuthenticated = Boolean(localStorage.getItem('syltourToken'));
        const authRequired = modal.querySelector('#authRequired');
        const actionForm = modal.querySelector('#actionForm');
        const requestType = trigger.dataset.bookingType;
        modal.querySelector('#actionModalTitle').textContent = requestType === 'guide'
            ? 'Book a local guide'
            : 'Request trip planning';
        modal.querySelector('#requestType').value = requestType;
        modal.querySelector('#formStatus').textContent = '';
        modal.querySelector('#formStatus').className = 'form-status';
        authRequired.hidden = isAuthenticated;
        actionForm.hidden = !isAuthenticated;
        const attractionSelect = modal.querySelector('#bookingAttraction');
        if (trigger.dataset.attractionId) {
            attractionSelect.value = trigger.dataset.attractionId;
        }
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        (isAuthenticated ? attractionSelect : authRequired.querySelector('a')).focus();
    });

    modal.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    modal.querySelector('#actionForm').addEventListener('submit', async event => {
        event.preventDefault();
        const actionForm = event.currentTarget;
        const form = new FormData(actionForm);
        const status = modal.querySelector('#formStatus');
        const submitButton = modal.querySelector('#bookingSubmit');
        const token = localStorage.getItem('syltourToken');
        if (!token) {
            status.textContent = 'Your session has expired. Please log in again.';
            status.className = 'form-status error';
            return;
        }
        submitButton.disabled = true;
        status.textContent = 'Sending your request...';
        status.className = 'form-status';
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(Object.fromEntries(form.entries()))
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Unable to send your request.');
            }
            status.textContent = data.message || 'Your request was submitted.';
            status.className = 'form-status success';
            const dashboardLink = document.createElement('a');
            dashboardLink.href = 'dashboard.html';
            dashboardLink.textContent = ' View your requests';
            status.appendChild(dashboardLink);
            actionForm.reset();
            updateBookingAttractions();
        } catch (error) {
            status.textContent = error.message;
            status.className = 'form-status error';
        } finally {
            submitButton.disabled = false;
        }
    });
}

// ===== FILTER & SEARCH FUNCTION =====
function filterSpots() {
    const searchInput = document.getElementById('searchInput');
    const rawSearchTerm = searchInput ? normalizeSearchText(searchInput.value) : '';
    const districtSearchTerm = districtSearchAliases[rawSearchTerm] || '';
    const searchTerm = districtSearchTerm ? '' : (searchAliases[rawSearchTerm] || rawSearchTerm);
    const districtFilter = document.getElementById('districtFilter');
    const selectedDistrict = districtFilter ? districtFilter.value : 'all';
    
    const activeFilter = document.querySelector('.filter-btn.active');
    const filterCategory = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    const isHomePage = Boolean(document.getElementById('spotGrid'));
    const showAllHomeResults = Boolean(rawSearchTerm || districtSearchTerm || selectedDistrict !== 'all' || filterCategory !== 'all');
    
    const cards = document.querySelectorAll('.place-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const searchableText = card.dataset.search || normalizeSearchText(card.textContent);
        const category = (card.getAttribute('data-category') || '').toLocaleLowerCase();
        
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        const matchesFilter = filterCategory === 'all' || category === filterCategory;
        const cardDistrict = card.dataset.district || getAttractionDistrict(card.querySelector('.location')?.textContent);
        const matchesSelectedDistrict = selectedDistrict === 'all' || cardDistrict === selectedDistrict;
        const matchesSearchDistrict = !districtSearchTerm || cardDistrict === districtSearchTerm;
        const matchesDistrict = matchesSelectedDistrict && matchesSearchDistrict;
        const matchesHomeFeature = !isHomePage || showAllHomeResults || card.dataset.featured === 'true';
        
        if (matchesSearch && matchesFilter && matchesDistrict && matchesHomeFeature) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Update count
    const countElement = document.getElementById('countNumber');
    if (countElement) {
        countElement.textContent = visibleCount;
    }

    const grid = document.getElementById('spotGrid') || document.getElementById('attractionsGrid');
    if (grid) {
        let emptyState = document.getElementById('noSearchResults');
        if (!emptyState) {
            emptyState = document.createElement('p');
            emptyState.id = 'noSearchResults';
            emptyState.className = 'search-empty-state';
            emptyState.setAttribute('role', 'status');
            grid.insertAdjacentElement('afterend', emptyState);
        }
        emptyState.textContent = rawSearchTerm
            ? `No destinations found for "${searchInput.value.trim()}". Try another name, location or category.`
            : 'No destinations match the selected filters.';
        emptyState.hidden = visibleCount > 0 || cards.length === 0;
    }
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== ACTIVE NAV LINK HIGHLIGHT =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage) {
        link.classList.add('active');
    }
});

console.log('🛫 SylTour — Discover the Beauty of Sylhet');
