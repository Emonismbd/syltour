document.addEventListener('DOMContentLoaded', loadAttractionDetails);

async function loadAttractionDetails() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');
    const requestedName = params.get('name') || '';
    const requestedDistrict = params.get('district') || '';
    const fallbackSummary = params.get('summary') || '';
    const fallbackDetails = params.get('details') || '';
    const fallbackImage = params.get('image') || '';
    const status = document.getElementById('attractionDetailStatus');

    if (!status) return;

    if (!requestedId && !requestedName) {
        status.textContent = 'Choose a destination from a district guide to see its details.';
        return;
    }

    let attraction = null;
    try {
        const response = await fetch(requestedId
            ? `/api/attractions/${encodeURIComponent(requestedId)}`
            : '/api/attractions');
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unable to load destination records.');
        }
        if (requestedId) {
            if (!data.attraction || typeof data.attraction !== 'object') {
                throw new Error('The destination service returned an invalid response.');
            }
            attraction = data.attraction;
        } else {
            if (!Array.isArray(data.attractions)) {
                throw new Error('The destination service returned an invalid response.');
            }
            attraction = data.attractions.find(item =>
                normalizeAttractionName(item.name) === normalizeAttractionName(requestedName)
            ) || null;
        }
    } catch (error) {
        console.error('Unable to load attraction details:', error);
        status.textContent = 'Destination details could not be loaded. Please try again later.';
        return;
    }

    if (!attraction) {
        renderUnlistedAttraction(requestedName, requestedDistrict, fallbackSummary, fallbackDetails, fallbackImage);
        return;
    }

    renderAttraction(attraction, requestedDistrict, fallbackDetails);
}

function renderAttraction(attraction, requestedDistrict, fallbackDetails) {
    const name = String(attraction.name || 'Destination');
    const location = String(attraction.location || requestedDistrict || '');
    const details = String(attraction.full_details || '').trim();
    const summary = String(attraction.description || '').trim();
    const card = document.getElementById('attractionDetailCard');

    document.title = `${name} — SylTour`;
    document.getElementById('attractionDetailName').textContent = name;
    document.getElementById('attractionDetailLocation').textContent = [location, attraction.category].filter(Boolean).join(' · ');
    document.getElementById('attractionDetailSummary').textContent = summary;
    setAttractionImage(attraction.image_url, name);
    renderParagraphs(document.getElementById('attractionFullDetails'), details || fallbackDetails || 'Full visitor information has not been added yet. Check back soon for history, travel guidance, and other useful details.');
    setMapLink(name, location);
    setDistrictBackLink(requestedDistrict || location);
    card.hidden = false;
    document.getElementById('attractionDetailStatus').hidden = true;
}

function renderUnlistedAttraction(name, district, summary, fullDetails, imageUrl) {
    if (!name) {
        document.getElementById('attractionDetailStatus').textContent = 'This destination could not be found.';
        return;
    }

    document.title = `${name} — SylTour`;
    document.getElementById('attractionDetailName').textContent = name;
    document.getElementById('attractionDetailLocation').textContent = district;
    document.getElementById('attractionDetailSummary').textContent = summary;
    setAttractionImage(imageUrl, name);
    renderParagraphs(document.getElementById('attractionFullDetails'), fullDetails || 'Full visitor information is not available yet. An administrator can add this destination and its details from the Admin Dashboard.');
    setMapLink(name, district);
    setDistrictBackLink(district);
    document.getElementById('attractionDetailCard').hidden = false;
    document.getElementById('attractionDetailStatus').hidden = true;
}

function renderParagraphs(container, text) {
    container.replaceChildren();
    const paragraphs = text.split(/\r?\n\s*\r?\n/).map(value => value.trim()).filter(Boolean);
    paragraphs.forEach(paragraph => {
        const element = document.createElement('p');
        paragraph.split(/\r?\n/).forEach((line, index) => {
            if (index) element.appendChild(document.createElement('br'));
            element.appendChild(document.createTextNode(line));
        });
        container.appendChild(element);
    });
}

function setAttractionImage(imageUrl, name) {
    const image = document.getElementById('attractionDetailImage');
    image.alt = name;
    image.src = getAttractionImageUrl(imageUrl);
    image.addEventListener('error', () => {
        image.src = 'images/hero-sylhet.svg';
    }, { once: true });
}

function getAttractionImageUrl(imageUrl) {
    if (!imageUrl) return 'images/hero-sylhet.svg';
    try {
        const url = new URL(imageUrl, window.location.origin);
        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.href
            : 'images/hero-sylhet.svg';
    } catch (error) {
        return 'images/hero-sylhet.svg';
    }
}

function setMapLink(name, location) {
    const mapLink = document.getElementById('attractionMapLink');
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${location}`)}`;
}

function setDistrictBackLink(value) {
    const districtPages = [
        ['moulvibazar', 'moulvibazar.html'],
        ['sunamganj', 'sunamganj.html'],
        ['habiganj', 'habiganj.html'],
        ['sylhet', 'sylhet.html']
    ];
    const normalized = normalizeAttractionName(value);
    const page = districtPages.find(([district]) => normalized.includes(district));
    if (page) {
        const link = document.getElementById('attractionBackLink');
        link.href = page[1];
        link.textContent = `Back to ${page[0].charAt(0).toUpperCase()}${page[0].slice(1)}`;
    }
}

function normalizeAttractionName(value) {
    return String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}
