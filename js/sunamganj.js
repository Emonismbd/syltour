const sunamganjPlaces = [
    {
        key: 'narayantala',
        name: 'Narayantala',
        description: 'A quiet destination near the Bangladesh-India border, about 12 km from Sunamganj town, with views toward the Khasi hills of Meghalaya.',
        fullDetails: 'Narayantala is a peaceful border-area destination north of Sunamganj town, known for open countryside and views toward the Khasi hills of Meghalaya. The surrounding landscape offers a quieter contrast to the district’s busy haor routes.\n\nLocal road and weather conditions can affect the journey, particularly during the rainy season. Ask locally about the current route and respect border-area instructions and restricted zones.'
    },
    {
        key: 'pagla boro jame mosque',
        name: 'Pagla Boro Jame Mosque',
        description: 'A historic mosque at Pagla Bazar in Dakshin Sunamganj, set beside the Mahasing River and known for its distinctive architecture.',
        fullDetails: 'Pagla Boro Jame Mosque stands beside the Mahasing River at Pagla Bazar and is known locally for its distinctive form and long history. Its riverside setting makes the mosque an important local landmark as well as a place of worship.\n\nVisitors can travel from Sunamganj town by road toward Pagla Bazar. Please visit outside prayer times where possible, dress modestly, and ask permission before taking photographs inside the mosque.'
    },
    {
        key: 'lalghat waterfall',
        name: 'Lalghat Waterfall',
        description: 'A seasonal waterfall near the border in Tahirpur. Water flow and access conditions vary by season, so check locally before visiting.',
        fullDetails: 'Lalghat is a seasonal cascade in the border region of Tahirpur. Its flow and surrounding scenery are strongly influenced by rainfall, and the route is often combined with other nearby river and hill destinations.\n\nAccess can be difficult when water levels rise or weather changes. Confirm the route with local residents before leaving, use suitable transport, and keep away from slippery rocks and fast-moving water.'
    },
    {
        key: 'hason raja museum',
        name: 'Hason Raja Museum',
        description: 'Explore the life, music, and local heritage of Hason Raja, the celebrated mystic poet and songwriter from Sunamganj.',
        fullDetails: 'Hason Raja Museum celebrates the life and creative legacy of Hason Raja, the mystic poet, songwriter, and zamindar whose music became an enduring part of Bengali folk culture. Exhibits introduce visitors to his work and to the heritage of Sunamganj.\n\nThe museum is in Sunamganj town and can be included in a town visit. Opening times may vary, so check locally before travelling specifically to the museum and follow its photography and visitor rules.'
    },
    {
        key: 'barek tila',
        name: 'Barek Tila',
        description: 'A scenic hill near the border in Tahirpur, offering open views of the Jadukata River, countryside, and Meghalaya hills.',
        fullDetails: 'Barek Tila is a low hill in Tahirpur’s border landscape, with broad views over the surrounding countryside, river plains, and the hills of Meghalaya. It is often visited as part of a day trip around the nearby river destinations.\n\nThe approach can be affected by rain and seasonal road conditions. Arrange local transport in advance, carry drinking water, and stay on established paths while respecting local and border-area guidance.'
    },
    {
        key: 'jadukata river',
        name: 'Jadukata River',
        description: 'A clear river running beneath the hills near the Bangladesh-India border, known for its sandy banks and mountain scenery.'
    },
    {
        key: 'shimul bagan',
        name: 'Shimul Bagan',
        description: 'Located near the Jadukata River in Tahirpur, this silk-cotton tree garden turns vivid red when its flowers bloom in late winter.'
    },
    {
        key: 'niladri lake',
        name: 'Niladri Lake',
        description: 'Also known as Shaheed Siraj Lake, this blue limestone quarry lake near Tekerghat is framed by the hills of the border region.'
    },
    {
        key: 'tanguar haor',
        name: 'Tanguar Haor',
        description: 'One of Bangladesh’s largest wetlands, known for monsoon boat trips and winter gatherings of migratory birds beneath the Meghalaya hills.'
    }
];

document.addEventListener('DOMContentLoaded', loadSunamganjAttractions);

async function loadSunamganjAttractions() {
    const grid = document.getElementById('sunamganjGrid');
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
        status.textContent = 'Showing featured Sunamganj destinations. Live database details are unavailable.';
        status.hidden = false;
        console.error('Unable to load Sunamganj attraction records:', error);
    }

    const places = sunamganjPlaces.map(place => {
        const attraction = attractions.find(item =>
            String(item.name || '').trim().toLocaleLowerCase() === place.key
        );
        return createDistrictCard(place, attraction);
    });
    grid.replaceChildren(...places);
}

function createDistrictCard(place, attraction) {
    const card = document.createElement('article');
    card.className = 'district-place-card';

    const imageLink = document.createElement('a');
    imageLink.className = 'district-place-image';
    imageLink.href = getDistrictPlaceUrl(place, attraction);
    imageLink.setAttribute('aria-label', `Details about ${place.name}`);

    const image = document.createElement('img');
    image.src = getDistrictImageUrl(attraction && attraction.image_url);
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
    districtLink.href = 'sunamganj.html';
    districtLink.textContent = 'Sunamganj';
    content.appendChild(districtLink);

    const heading = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = getDistrictPlaceUrl(place, attraction);
    titleLink.textContent = place.name;
    heading.appendChild(titleLink);
    content.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = place.description;
    content.appendChild(description);

    const details = document.createElement('a');
    details.className = 'district-details-link';
    details.href = getDistrictPlaceUrl(place, attraction);
    details.append(document.createTextNode('Details '));
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-arrow-right';
    arrow.setAttribute('aria-hidden', 'true');
    details.appendChild(arrow);
    content.appendChild(details);

    card.appendChild(content);
    return card;
}

function getDistrictPlaceUrl(place, attraction) {
    const params = new URLSearchParams({
        name: place.name,
        district: 'Sunamganj',
        summary: place.description,
        details: place.fullDetails || ''
    });
    if (attraction) params.set('id', attraction.id);
    const imageUrl = (attraction && attraction.image_url) || place.imageUrl;
    if (imageUrl) params.set('image', imageUrl);
    return `attraction.html?${params}`;
}

function getDistrictImageUrl(imageUrl) {
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
