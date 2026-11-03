CREATE DATABASE IF NOT EXISTS syltour
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE syltour;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('traveler', 'guide', 'business', 'admin') NOT NULL DEFAULT 'traveler',
    approved TINYINT(1) NOT NULL DEFAULT 0,
    email_verified TINYINT(1) NOT NULL DEFAULT 0,
    verification_token VARCHAR(128) NULL,
    verification_expires DATETIME NULL,
    reset_token VARCHAR(6) NULL,
    reset_expires DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email),
    KEY users_verification_token_idx (verification_token),
    KEY users_reset_token_idx (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attractions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(180) NOT NULL,
    category VARCHAR(80) NOT NULL,
    location VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    full_details LONGTEXT NULL,
    image_url VARCHAR(2048) NULL,
    approved TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY attractions_approved_name_idx (approved, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    attraction_id INT UNSIGNED NOT NULL,
    request_type ENUM('trip', 'guide', 'hotel') NOT NULL,
    details TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY bookings_user_created_idx (user_id, created_at),
    KEY bookings_attraction_idx (attraction_id),
    KEY bookings_status_created_idx (status, created_at),
    CONSTRAINT bookings_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT bookings_attraction_fk
        FOREIGN KEY (attraction_id) REFERENCES attractions (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO attractions (name, category, location, description, image_url, approved)
SELECT seed.name, seed.category, seed.location, seed.description, seed.image_url, 1
FROM (
    SELECT
        'Jaflong' AS name,
        'mountain' AS category,
        'Sylhet Sadar' AS location,
        'Nestled at the foot of the Meghalaya hills, Jaflong is a paradise for nature lovers. The crystal-clear river, colorful stones, and lush green hills create a breathtaking landscape.' AS description,
        'https://upload.wikimedia.org/wikipedia/commons/4/42/Jaflong_by_Muhammad_Nazmul_Hasan_1.jpg' AS image_url
    UNION ALL SELECT
        'Bichnakandi', 'river', 'Sylhet',
        'A stunning natural spot where the river, stones, and hills meet in perfect harmony. The emerald green water and surrounding hills make it a photographer''s dream.',
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Bichnakandi%2C_Sylhet.jpg'
    UNION ALL SELECT
        'Ratargul Swamp Forest', 'swamp', 'Gowainghat',
        'Bangladesh''s only freshwater swamp forest. During monsoon, the forest is submerged in 4-10 feet of water, creating a surreal landscape.',
        'https://upload.wikimedia.org/wikipedia/commons/9/9b/Ratargul_0276.jpg'
    UNION ALL SELECT
        'Lalakhal', 'river', 'Jaintapur',
        'Famous for its crystal-clear blue-green water, Lalakhal is a serene river spot. The water changes color throughout the day, offering a magical experience.',
        'https://upload.wikimedia.org/wikipedia/commons/5/5c/Lalakhal%2C_Sharighat%2C_Sylhet%2C_Bangladesh.jpg'
    UNION ALL SELECT
        'Tanguar Haor', 'swamp', 'Sunamganj',
        'One of Bangladesh''s largest wetlands. During winter, thousands of migratory birds flock here. Boating at sunrise is a magical experience.',
        'https://upload.wikimedia.org/wikipedia/commons/d/d2/Selling_snacks_in_Tanguar_Haor.jpg'
    UNION ALL SELECT
        'Niladri Lake', 'lake', 'Sunamganj',
        'A vivid blue lake formed in an abandoned limestone quarry near the Meghalaya hills. The landscape is especially striking in the dry season.',
        NULL
    UNION ALL SELECT
        'Shimul Bagan', 'park', 'Sunamganj',
        'A large silk-cotton tree garden near the Jadukata River. In late winter, the red blossoms create a memorable seasonal landscape.',
        NULL
    UNION ALL SELECT
        'Jadukata River', 'river', 'Sunamganj',
        'A clear river flowing beside the hills near the Bangladesh-India border, known for its open riverbanks and mountain views.',
        NULL
    UNION ALL SELECT
        'Barek Tila', 'mountain', 'Sunamganj',
        'A scenic hill near the border in Tahirpur, offering wide views of the surrounding countryside, river, and Meghalaya hills.',
        NULL
    UNION ALL SELECT
        'Hason Raja Museum', 'museum', 'Sunamganj',
        'A local heritage museum celebrating the life and music of Hason Raja, the celebrated mystic poet from Sunamganj.',
        NULL
    UNION ALL SELECT
        'Narayantala', 'mountain', 'Sunamganj',
        'A peaceful border-side destination north of Sunamganj town, with views toward the Khasi hills of Meghalaya.',
        NULL
    UNION ALL SELECT
        'Lalghat Waterfall', 'river', 'Sunamganj',
        'A seasonal cascade near the border in Tahirpur. Water flow and access conditions vary with the season.',
        NULL
    UNION ALL SELECT
        'Pagla Boro Jame Mosque', 'religious', 'Sunamganj',
        'A historic mosque by the Mahasing River at Pagla Bazar, noted for its distinctive architecture and long local history.',
        NULL
    UNION ALL SELECT
        'Sreemangal Tea Gardens', 'tea-garden', 'Moulvibazar',
        'Sreemangal is Bangladesh''s tea capital, known for endless green tea gardens, quiet trails, and scenic countryside.',
        'https://upload.wikimedia.org/wikipedia/commons/4/46/Tea-Garden%2CSreemangal%2CSylhet.jpg'
    UNION ALL SELECT
        'Lawachara National Park', 'jungle', 'Kamalganj, Moulvibazar',
        'A tropical forest in Kamalganj with rich biodiversity, mature tree canopy, and peaceful nature trails.',
        'https://upload.wikimedia.org/wikipedia/commons/6/64/Lawachara_Forest.jpg'
    UNION ALL SELECT
        'Baikka Beel', 'swamp', 'Sreemangal, Moulvibazar',
        'A wetland sanctuary on the edge of Hail Haor, known for birdlife and beautiful early-morning views.',
        'https://upload.wikimedia.org/wikipedia/commons/e/ec/Sunrise_at_Baikka_Bil%2C_Moulovibazar_%287174718272%29.jpg'
    UNION ALL SELECT
        'Camellia Lake', 'lake', 'Kamalganj, Moulvibazar',
        'A quiet lake set among the tea gardens and low hills of Kamalganj, ideal for a relaxed visit and nature photography.',
        NULL
    UNION ALL SELECT
        'Bird Park and Eco Village', 'park', 'Moulvibazar',
        'A nature-focused retreat in the countryside, offering a quiet setting to enjoy greenery and observe local birdlife.',
        NULL
    UNION ALL SELECT
        'Bilashchora Lake', 'lake', 'Sreemangal, Moulvibazar',
        'A calm lake near Sreemangal, surrounded by green slopes and a peaceful landscape for a short nature escape.',
        NULL
    UNION ALL SELECT
        'Tipra Cherra Golf Course', 'park', 'Sreemangal, Moulvibazar',
        'A scenic golf course in Sreemangal set among rolling tea-country hills and open green spaces.',
        NULL
    UNION ALL SELECT
        'Hail Haor', 'swamp', 'Moulvibazar',
        'A vast seasonal wetland shared by Moulvibazar and Habiganj, attracting waterbirds and changing character with the seasons.',
        NULL
    UNION ALL SELECT
        'Patharia Hill', 'mountain', 'Barlekha, Moulvibazar',
        'A forested hill range near Barlekha offering an adventurous glimpse of the district''s borderland landscape.',
        NULL
    UNION ALL SELECT
        'Parikunda Waterfall', 'waterfall', 'Barlekha, Moulvibazar',
        'A waterfall tucked into the hills of Barlekha, best explored with care and with local advice about seasonal access.',
        NULL
    UNION ALL SELECT
        'Adampur Forest', 'jungle', 'Kamalganj, Moulvibazar',
        'A green forest area in Kamalganj with quiet trails, natural scenery, and a glimpse of the region''s rich biodiversity.',
        NULL
    UNION ALL SELECT
        'Darjeeling Hill', 'mountain', 'Sreemangal, Moulvibazar',
        'A scenic hill in Sreemangal''s tea-country, popular for its elevated views over nearby gardens and countryside.',
        NULL
    UNION ALL SELECT
        'Bir Shrestho Hamidur Rahman Memorial', 'historical', 'Dhalai, Moulvibazar',
        'A memorial in Dhalai commemorating Bir Shrestho Hamidur Rahman and his sacrifice in the Liberation War.',
        NULL
    UNION ALL SELECT
        'Kala Pahar', 'mountain', 'Kulaura, Moulvibazar',
        'A well-known hill in Kulaura for visitors seeking an adventurous walk and broad views of the surrounding countryside.',
        NULL
    UNION ALL SELECT
        'Hazrat Shahjalal Shrine', 'religious', 'Sylhet City',
        'The most revered religious site in Sylhet. Hazrat Shahjalal (R.) spread Islam in the region. The architecture and spiritual atmosphere are truly inspiring.',
        'https://upload.wikimedia.org/wikipedia/commons/6/68/Shrine_of_Hazrat_Shah_Jalal_Sylhet_Bangladesh_39.JPG'
    UNION ALL SELECT
        'Hazrat Shahparan Shrine', 'religious', 'Sylhet',
        'The tomb of the nephew of Hazrat Shahjalal (R.). Located in a peaceful natural setting, this shrine is a place of spiritual solace.',
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Shrine_of_Hazrat_Shah_Paran_Sylhet_Bangladesh_38.JPG'
    UNION ALL SELECT
        'Ali Amjad''s Clock', 'museum', 'Surma River',
        'A historical landmark from the British period, situated on the banks of the Surma River. It''s one of the oldest clocks in Bangladesh.',
        'https://upload.wikimedia.org/wikipedia/commons/7/77/Keane_Bridge_and_Ali_Amjad%27s_Clock%2C_Sylhet.jpg'
    UNION ALL SELECT
        'Rema-Kalenga Wildlife Sanctuary', 'jungle', 'Chunarughat, Habiganj',
        'A protected forest landscape in Chunarughat, known for evergreen woodland, wildlife, and quiet walking trails.',
        'https://upload.wikimedia.org/wikipedia/commons/2/20/Rema_Kalenga_Wildlife_Sanctuary.jpg'
    UNION ALL SELECT
        'Polo Bawa Festival', 'culture', 'Habiganj',
        'A seasonal community fishing tradition where villagers gather with bamboo polo traps to fish in the wetlands.',
        NULL
    UNION ALL SELECT
        'Sankarpasha Shahi Mosque', 'religious', 'Rajura, Habiganj',
        'A historic Sultanate-era mosque in the Rajura area, valued for its heritage and distinctive brick architecture.',
        NULL
    UNION ALL SELECT
        'Bithangal Bara Akhara', 'religious', 'Baniachong, Habiganj',
        'A historic Vaishnavite monastery in Bithangal village, known for its religious heritage and traditional architecture.',
        NULL
    UNION ALL SELECT
        'Greenland Park', 'park', 'Chunarughat, Habiganj',
        'A green family recreation spot in the Ranigaon area of Chunarughat, surrounded by the landscapes of rural Habiganj.',
        NULL
    UNION ALL SELECT
        'The Palace Luxury Resort', 'resort', 'Bahubal, Habiganj',
        'A hilltop resort in Putijuri, Bahubal, set among forested hills and designed for a peaceful getaway.',
        NULL
    UNION ALL SELECT
        'Satchari National Park', 'jungle', 'Chunarughat, Habiganj',
        'A protected forest in Chunarughat with native trees, wildlife, and marked trails through the Raghunandan Hills.',
        NULL
) AS seed
LEFT JOIN attractions existing ON existing.name = seed.name
WHERE existing.id IS NULL;
