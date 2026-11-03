const habiganjPlaces = [
    {
        key: 'rema-kalenga wildlife sanctuary',
        name: 'Rema-Kalenga Wildlife Sanctuary',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Rema_Kalenga_Wildlife_Sanctuary.jpg',
        description: 'Explore one of Bangladesh’s largest natural forest areas, known for evergreen woodland, rich wildlife, and quiet walking trails.',
        fullDetails: 'Rema-Kalenga Wildlife Sanctuary in Chunarughat protects a large area of natural forest in Habiganj. Its evergreen trees, varied wildlife, and quiet trails offer a chance to experience one of the country’s important forest landscapes.\n\nPlan the visit during daylight and ask local forest staff about entry arrangements and suitable trails. Wear comfortable shoes, carry water, avoid feeding or disturbing wildlife, and take all litter back with you.'
    },
    {
        key: 'polo bawa festival',
        name: 'Polo Bawa Festival',
        description: 'A traditional community fishing festival where villagers gather with bamboo polo traps to fish together in seasonal wetlands.',
        fullDetails: 'Polo Bawa is a traditional communal fishing event associated with the wetlands of Habiganj. During the seasonal gathering, people enter shallow water together using polo, a traditional bamboo fishing trap, keeping alive a shared rural custom.\n\nThe event depends on local timing and water conditions and may not take place on a fixed visitor schedule. Ask residents about the date and appropriate viewing areas, and observe respectfully without disrupting participants.'
    },
    {
        key: 'sankarpasha shahi mosque',
        name: 'Sankarpasha Shahi Mosque',
        description: 'A historic Sultanate-era mosque in the Rajura area, valued for its heritage and distinctive brick architecture.',
        fullDetails: 'Sankarpasha Shahi Mosque is a historic mosque in the Rajura area of Habiganj, associated with the Sultanate period. Its brick construction and traditional design make it an important example of the district’s architectural and religious heritage.\n\nThe mosque remains a place of worship. Visitors should dress modestly, avoid entering during prayer without permission, and ask caretakers before photographing the building or its interior.'
    },
    {
        key: 'bithangal bara akhara',
        name: 'Bithangal Bara Akhara',
        description: 'A historic Vaishnavite monastery in Bithangal village, known for its religious heritage and traditional architecture.',
        fullDetails: 'Bithangal Bara Akhara in Bithangal village, Baniachong, is a historic Vaishnavite religious complex tied to the region’s devotional and cultural traditions. Its setting and heritage make it a distinctive stop for visitors interested in local history.\n\nAs an active religious site, the akhara deserves a quiet and respectful visit. Confirm the route locally, ask before taking photographs, and follow any directions from residents or caretakers.'
    },
    {
        key: 'greenland park',
        name: 'Greenland Park',
        description: 'A green family recreation spot in the Ranigaon area of Chunarughat, surrounded by the landscapes of rural Habiganj.',
        fullDetails: 'Greenland Park is a landscaped recreation destination in the Ranigaon area of Chunarughat. Its greenery and open grounds make it a relaxed option for families and visitors exploring the countryside around Habiganj.\n\nFacilities, entry arrangements, and opening hours can change. Check with the park or local residents before travelling, especially on weekdays or outside holiday periods.'
    },
    {
        key: 'the palace luxury resort',
        name: 'The Palace Luxury Resort',
        description: 'A hilltop resort in Putijuri, Bahubal, set among forested hills and designed for a peaceful getaway.'
    },
    {
        key: 'satchari national park',
        name: 'Satchari National Park',
        description: 'A protected forest in Chunarughat with native trees, wildlife, and marked trails through the Raghunandan Hills.'
    }
];

document.addEventListener('DOMContentLoaded', loadHabiganjAttractions);

async function loadHabiganjAttractions() {
    const grid = document.getElementById('habiganjGrid');
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
        status.textContent = 'Showing featured Habiganj attractions. Live database details are unavailable.';
        status.hidden = false;
        console.error('Unable to load Habiganj attraction records:', error);
    }

    grid.replaceChildren(...habiganjPlaces.map(place => {
        const attraction = attractions.find(item =>
            String(item.name || '').trim().toLocaleLowerCase() === place.key
        );
        return createHabiganjCard(place, attraction);
    }));
}

function createHabiganjCard(place, attraction) {
    const card = document.createElement('article');
    card.className = 'district-place-card';

    const imageLink = document.createElement('a');
    imageLink.className = 'district-place-image';
    imageLink.href = getHabiganjPlaceUrl(place, attraction);
    imageLink.setAttribute('aria-label', `Details about ${place.name}`);

    const image = document.createElement('img');
    image.src = getHabiganjImageUrl((attraction && attraction.image_url) || place.imageUrl);
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
    districtLink.href = 'habiganj.html';
    districtLink.textContent = 'Habiganj';
    content.appendChild(districtLink);

    const heading = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = getHabiganjPlaceUrl(place, attraction);
    titleLink.textContent = place.name;
    heading.appendChild(titleLink);
    content.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = place.description;
    content.appendChild(description);

    const details = document.createElement('a');
    details.className = 'district-details-link';
    details.href = getHabiganjPlaceUrl(place, attraction);
    details.append(document.createTextNode('Details '));
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-arrow-right';
    arrow.setAttribute('aria-hidden', 'true');
    details.appendChild(arrow);
    content.appendChild(details);

    card.appendChild(content);
    return card;
}

function getHabiganjPlaceUrl(place, attraction) {
    const params = new URLSearchParams({
        name: place.name,
        district: 'Habiganj',
        summary: place.description,
        details: place.fullDetails || ''
    });
    if (attraction) params.set('id', attraction.id);
    const imageUrl = (attraction && attraction.image_url) || place.imageUrl;
    if (imageUrl) params.set('image', imageUrl);
    return `attraction.html?${params}`;
}

function getHabiganjImageUrl(imageUrl) {
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
