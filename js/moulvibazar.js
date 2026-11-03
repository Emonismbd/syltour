const moulvibazarPlaces = [
    {
        key: 'lawachara national park',
        name: 'Lawachara National Park',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Lawachara_Forest.jpg',
        description: 'Walk beneath the canopy of a tropical forest in Kamalganj, home to rich biodiversity and peaceful nature trails.',
        fullDetails: 'Lawachara National Park is a protected tropical forest in Kamalganj, known for its tall trees, wildlife, and walking trails. A guided walk offers a closer look at the forest ecosystem and the plants and animals that live there.\n\nVisit during daylight and follow entry and trail guidance from park staff or local guides. Wear comfortable walking shoes, keep noise low, do not feed wildlife, and avoid leaving litter in the forest.'
    },
    {
        key: 'sreemangal tea gardens',
        name: 'Sreemangal Tea Gardens',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Tea_Gardens_of_Sreemangal_01.jpg',
        description: 'Rolling rows of tea bushes and gentle green hills make Sreemangal a memorable place for slow scenic walks.',
        fullDetails: 'Sreemangal is the heart of Bangladesh’s tea-growing landscape. Neat rows of tea bushes spread across the rolling hills, creating the green scenery that has made the area a favourite for relaxed countryside trips.\n\nSome tea estates are private working properties, so visitors should ask permission before entering or taking photographs. Local guides and transport can help plan a respectful visit, especially during busy harvest periods.'
    },
    {
        key: 'baikka beel',
        name: 'Baikka Beel',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Sunrise_at_Baikka_Bil%2C_Moulovibazar_%287174718272%29.jpg',
        description: 'A wetland sanctuary on the edge of Hail Haor, especially known for birdlife and beautiful early-morning views.',
        fullDetails: 'Baikka Beel is a wetland sanctuary connected to the Hail Haor basin near Sreemangal. It is an important habitat for waterbirds and a rewarding place to observe wetland life, particularly during the cooler months when migratory birds may be present.\n\nEarly morning is often a peaceful time to visit. Bring binoculars if available, keep a respectful distance from wildlife, and check local water and access conditions before travelling.'
    },
    {
        key: 'camellia lake',
        name: 'Camellia Lake',
        description: 'A quiet lake set among the tea gardens and low hills of Kamalganj, ideal for a relaxed visit and nature photography.',
        fullDetails: 'Camellia Lake is a peaceful waterside spot in the Kamalganj tea-growing area. Green slopes and nearby tea gardens create a calm setting for a short break, photography, and enjoying the countryside.\n\nAccess and facilities can depend on the estate or property where the lake is located. Confirm permission and the route locally before visiting, and take care around the water’s edge.'
    },
    {
        key: 'bird park and eco village',
        name: 'Bird Park and Eco Village',
        description: 'A nature-focused retreat in the countryside, offering a quiet setting to enjoy greenery and observe local birdlife.',
        fullDetails: 'Bird Park and Eco Village is a countryside recreation spot in Moulvibazar, offering a green setting for a relaxed visit and an opportunity to enjoy local nature. It can suit visitors looking for a quieter alternative to the district’s larger forest and wetland attractions.\n\nFacilities, opening hours, and entry arrangements may change. Contact the venue or ask locally before travelling, and follow any guidance about wildlife and photography.'
    },
    {
        key: 'bilashchora lake',
        name: 'Bilashchora Lake',
        description: 'A calm lake near Sreemangal, surrounded by green slopes and a peaceful landscape for a short nature escape.'
    },
    {
        key: 'tipra cherra golf course',
        name: 'Tipra Cherra Golf Course',
        description: 'A scenic golf course in Sreemangal set among rolling tea-country hills and open green spaces.'
    },
    {
        key: 'hail haor',
        name: 'Hail Haor',
        description: 'A vast seasonal wetland shared by Moulvibazar and Habiganj, attracting waterbirds and changing character with the seasons.'
    },
    {
        key: 'patharia hill',
        name: 'Patharia Hill',
        description: 'A forested hill range near Barlekha offering an adventurous glimpse of the district’s borderland landscape.'
    },
    {
        key: 'parikunda waterfall',
        name: 'Parikunda Waterfall',
        description: 'A waterfall tucked into the hills of Barlekha, best explored with care and with local advice about seasonal access.'
    },
    {
        key: 'adampur forest',
        name: 'Adampur Forest',
        description: 'A green forest area in Kamalganj with quiet trails, natural scenery, and a glimpse of the region’s rich biodiversity.'
    },
    {
        key: 'darjeeling hill',
        name: 'Darjeeling Hill',
        description: 'A scenic hill in Sreemangal’s tea-country, popular for its elevated views over nearby gardens and countryside.'
    },
    {
        key: 'bir shrestho hamidur rahman memorial',
        name: 'Bir Shrestho Hamidur Rahman Memorial',
        description: 'A memorial in Dhalai commemorating Bir Shrestho Hamidur Rahman and his sacrifice in the Liberation War.'
    },
    {
        key: 'kala pahar',
        name: 'Kala Pahar',
        description: 'A well-known hill in Kulaura for visitors seeking a more adventurous walk and broad views of the surrounding countryside.'
    }
];

document.addEventListener('DOMContentLoaded', loadMoulvibazarAttractions);

async function loadMoulvibazarAttractions() {
    const grid = document.getElementById('moulvibazarGrid');
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
        status.textContent = 'Showing featured Moulvibazar attractions. Live database details are unavailable.';
        status.hidden = false;
        console.error('Unable to load Moulvibazar attraction records:', error);
    }

    grid.replaceChildren(...moulvibazarPlaces.map(place => {
        const attraction = attractions.find(item =>
            String(item.name || '').trim().toLocaleLowerCase() === place.key
        );
        return createMoulvibazarCard(place, attraction);
    }));
}

function createMoulvibazarCard(place, attraction) {
    const card = document.createElement('article');
    card.className = 'district-place-card';

    const placeUrl = getMoulvibazarPlaceUrl(place, attraction);
    const imageLink = document.createElement('a');
    imageLink.className = 'district-place-image';
    imageLink.href = placeUrl;
    imageLink.setAttribute('aria-label', `Details about ${place.name}`);

    const image = document.createElement('img');
    image.src = getMoulvibazarImageUrl(place.imageUrl || (attraction && attraction.image_url));
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
    districtLink.href = 'moulvibazar.html';
    districtLink.textContent = 'Moulvibazar';
    content.appendChild(districtLink);

    const heading = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = placeUrl;
    titleLink.textContent = place.name;
    heading.appendChild(titleLink);
    content.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = place.description;
    content.appendChild(description);

    const details = document.createElement('a');
    details.className = 'district-details-link';
    details.href = placeUrl;
    details.append(document.createTextNode('Details '));
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-arrow-right';
    arrow.setAttribute('aria-hidden', 'true');
    details.appendChild(arrow);
    content.appendChild(details);

    card.appendChild(content);
    return card;
}

function getMoulvibazarPlaceUrl(place, attraction) {
    const params = new URLSearchParams({
        name: place.name,
        district: 'Moulvibazar',
        summary: place.description,
        details: place.fullDetails || ''
    });
    if (attraction) params.set('id', attraction.id);
    const imageUrl = place.imageUrl || (attraction && attraction.image_url);
    if (imageUrl) params.set('image', imageUrl);
    return `attraction.html?${params}`;
}

function getMoulvibazarImageUrl(imageUrl) {
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
