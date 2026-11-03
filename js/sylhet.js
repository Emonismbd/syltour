const sylhetPlaces = [
    {
        key: 'jaflong',
        name: 'Jaflong',
        description: 'A scenic riverside destination at the foot of the Meghalaya hills, known for its clear water, stone riverbeds, and striking mountain views.',
        fullDetails: 'Jaflong lies beside the Dawki River at the northern edge of Sylhet, where the river valley meets the hills of Meghalaya. Its broad views, flowing water, and distinctive stone riverbed make it one of the region’s best-known day trips.\n\nVisitors usually spend time by the river and take in the hill scenery. Water levels and river conditions change with the season, so choose a safe, locally operated boat when available and follow local guidance near the water.'
    },
    {
        key: 'bichnakandi',
        name: 'Bichnakandi',
        description: 'A beautiful meeting point of hills, streams, and stone beds where water flows down from the Meghalaya highlands.',
        fullDetails: 'Bichnakandi is a scenic riverside area in Gowainghat where streams from the Meghalaya hills meet the Piyain River. The landscape is known for clear seasonal water, smooth stones, and a wide view of the surrounding hills.\n\nThe appearance of the river changes through the year: monsoon brings stronger flows, while dry-season water can be clearer and shallower. Check local transport and river conditions before setting out, and avoid slippery rocks and strong currents.'
    },
    {
        key: 'ratargul swamp forest',
        name: 'Ratargul Swamp Forest',
        description: 'Bangladesh’s best-known freshwater swamp forest. In the monsoon, boat rides pass through water-covered trees and quiet green waterways.',
        fullDetails: 'Ratargul is a freshwater swamp forest in Gowainghat, where the forest floor is covered by water during the monsoon. A small boat journey through the flooded trees offers a close look at this unusual wetland ecosystem and its seasonal scenery.\n\nWater depth and boat access depend on rainfall, so confirm conditions locally before visiting. Use an experienced boat operator, wear a life jacket, and help protect the forest by avoiding litter and loud disturbance to wildlife.'
    },
    {
        key: 'lalakhal',
        name: 'Lalakhal',
        description: 'A tranquil stretch of the Sari River celebrated for its blue-green water, boat trips, and views of the surrounding hills.',
        fullDetails: 'Lalakhal is a picturesque stretch of the Sari River near Jaintapur, framed by green banks and distant hills. The river’s colour can appear different with sunlight, water depth, and the season, making a slow boat ride a popular way to enjoy the scenery.\n\nVisitors commonly travel from Sylhet toward Sarighat and continue to the river by local transport. River conditions vary, so agree on a safe route with a local boat operator and follow their advice about current and weather.'
    },
    {
        key: 'hazrat shahjalal shrine',
        name: 'Hazrat Shahjalal Shrine',
        description: 'A major spiritual landmark in Sylhet city, visited for its history, peaceful atmosphere, and cultural significance.',
        fullDetails: 'The shrine of Hazrat Shahjalal (R.) is one of Sylhet’s most important spiritual and historical landmarks. It is closely associated with the region’s religious heritage and remains a place of prayer and pilgrimage for visitors from across Bangladesh.\n\nThe shrine is within Sylhet city and can be reached by local transport. Visitors should dress respectfully, observe the quiet of worshippers, and follow any guidance from shrine caretakers, especially during busy prayer times.'
    },
    {
        key: 'hazrat shahparan shrine',
        name: 'Hazrat Shahparan Shrine',
        description: 'A revered shrine set in a calm green area on the outskirts of Sylhet, associated with the region’s rich spiritual history.'
    },
    {
        key: "ali amjad's clock",
        name: "Ali Amjad's Clock",
        description: 'A distinctive nineteenth-century clock tower standing beside the Surma River near the historic Keane Bridge.'
    }
];

document.addEventListener('DOMContentLoaded', loadSylhetAttractions);

async function loadSylhetAttractions() {
    const grid = document.getElementById('sylhetGrid');
    const status = document.getElementById('districtLoadStatus');
    if (!grid || !status) return;

    let attractions = [];
    try {
        const response = await fetch('/api/attractions');
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unable to load destination records.');
        }
        if (!Array.isArray(data.attractions)) {
            throw new Error('The destination service returned an invalid response.');
        }
        attractions = data.attractions;
    } catch (error) {
        status.textContent = 'Showing featured Sylhet attractions. Live database details are unavailable.';
        status.hidden = false;
        console.error('Unable to load Sylhet attraction records:', error);
    }

    grid.replaceChildren(...sylhetPlaces.map(place => {
        const attraction = attractions.find(item =>
            String(item.name || '').trim().toLocaleLowerCase() === place.key
        );
        return createSylhetCard(place, attraction);
    }));
}

function createSylhetCard(place, attraction) {
    const card = document.createElement('article');
    card.className = 'district-place-card';

    const imageLink = document.createElement('a');
    imageLink.className = 'district-place-image';
    imageLink.href = getSylhetPlaceUrl(place, attraction);
    imageLink.setAttribute('aria-label', `Details about ${place.name}`);

    const image = document.createElement('img');
    image.src = getSylhetImageUrl(attraction && attraction.image_url);
    image.alt = place.name;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
        image.src = 'images/hero-sylhet.svg';
    }, { once: true });
    imageLink.appendChild(image);
    card.appendChild(imageLink);

    const content = document.createElement('div');
    content.className = 'district-place-content';

    const districtLink = document.createElement('a');
    districtLink.className = 'district-place-location';
    districtLink.href = 'sylhet.html';
    districtLink.textContent = 'Sylhet';
    content.appendChild(districtLink);

    const heading = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = getSylhetPlaceUrl(place, attraction);
    titleLink.textContent = place.name;
    heading.appendChild(titleLink);
    content.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = place.description;
    content.appendChild(description);

    const details = document.createElement('a');
    details.className = 'district-details-link';
    details.href = getSylhetPlaceUrl(place, attraction);
    details.append(document.createTextNode('Details '));
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-arrow-right';
    arrow.setAttribute('aria-hidden', 'true');
    details.appendChild(arrow);
    content.appendChild(details);

    card.appendChild(content);
    return card;
}

function getSylhetPlaceUrl(place, attraction) {
    const params = new URLSearchParams({
        name: place.name,
        district: 'Sylhet',
        summary: place.description,
        details: place.fullDetails || ''
    });
    if (attraction) params.set('id', attraction.id);
    const imageUrl = (attraction && attraction.image_url) || place.imageUrl;
    if (imageUrl) params.set('image', imageUrl);
    return `attraction.html?${params}`;
}

function getSylhetImageUrl(imageUrl) {
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
