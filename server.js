const path = require('path');
require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'development-only-change-me';
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'syltour',
    waitForConnections: true,
    connectionLimit: 10
});
const mailer = process.env.MAIL_USER && process.env.MAIL_PASSWORD
    ? nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT || 465),
        secure: Number(process.env.MAIL_PORT || 465) === 465,
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
    })
    : null;
const requestWindows = new Map();

app.use(express.json({ limit: '100kb' }));
app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'same-origin');
    next();
});
const publicPages = new Set([
    'admin.html',
    'attraction.html',
    'attractions.html',
    'dashboard.html',
    'food.html',
    'forgot-password.html',
    'habiganj.html',
    'guide.html',
    'index.html',
    'login.html',
    'moulvibazar.html',
    'reset-password.html',
    'signup.html',
    'stay.html',
    'sylhet.html',
    'sunamganj.html',
    'verify.html'
]);
const publicAssetDirectories = new Set(['css', 'images', 'js']);
app.use((request, response, next) => {
    let requestedPath;
    try {
        requestedPath = decodeURIComponent(request.path);
    } catch (error) {
        return next(error);
    }
    if (requestedPath === '/' || requestedPath === '/api' || requestedPath.startsWith('/api/')) {
        return next();
    }
    const relativePath = path.relative(__dirname, path.resolve(__dirname, `.${requestedPath}`));
    const pathSegments = relativePath.split(path.sep);
    const isPublicPage = pathSegments.length === 1 && publicPages.has(relativePath.toLowerCase());
    const isPublicAsset = pathSegments.length > 1 && publicAssetDirectories.has(pathSegments[0].toLowerCase());
    if (isPublicPage || isPublicAsset) {
        return next();
    }
    response.sendStatus(404);
});
app.use(express.static(__dirname));

function authRateLimit(request, response, next) {
    const key = `${request.ip}:${request.path}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 10;
    const current = requestWindows.get(key);
    if (!current || now - current.startedAt >= windowMs) {
        requestWindows.set(key, { startedAt: now, count: 1 });
        return next();
    }
    if (current.count >= maxRequests) {
        response.setHeader('Retry-After', Math.ceil((windowMs - (now - current.startedAt)) / 1000));
        return response.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }
    current.count += 1;
    next();
}

function createToken(user) {
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '2h' });
}

function authenticate(request, response, next) {
    const header = request.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
        return response.status(401).json({ error: 'Authentication required.' });
    }
    try {
        request.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        return response.status(401).json({ error: 'Invalid or expired session.' });
    }
}

function requireAdmin(request, response, next) {
    if (request.user.role !== 'admin') {
        return response.status(403).json({ error: 'Administrator access required.' });
    }
    next();
}

app.post('/api/auth/signup', authRateLimit, async (request, response, next) => {
    try {
        const { name, email, password, role } = request.body;
        const allowedRoles = ['traveler', 'guide', 'business'];
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8 || !allowedRoles.includes(role)) {
            return response.status(400).json({ error: 'Name, valid email, role, and an 8-character password are required.' });
        }
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
        if (existingUsers.length) {
            return response.status(409).json({ error: 'An account with this email already exists.' });
        }
        if (!mailer) {
            return response.status(503).json({ error: 'Email verification is not configured yet.' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = String(crypto.randomInt(100000, 1000000));
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, role, approved, email_verified, verification_token, verification_expires) VALUES (?, ?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
            [name.trim(), normalizedEmail, passwordHash, role, role === 'traveler' ? 1 : 0, verificationToken]
        );
        await mailer.sendMail({
            from: process.env.MAIL_USER,
            to: normalizedEmail,
            subject: 'Your SylTour verification code',
            text: `Your SylTour verification code is ${verificationToken}. It expires in 10 minutes.`,
            html: `<p>Welcome to SylTour.</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${verificationToken}</p><p>This code expires in 10 minutes.</p>`
        });
        response.status(201).json({ message: 'Account created. Check your email for the 6-digit verification code.', id: result.insertId });
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/login', authRateLimit, async (request, response, next) => {
    try {
        const normalizedEmail = String(request.body.email || '').trim().toLowerCase();
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
        const user = users[0];
        if (!user || !(await bcrypt.compare(request.body.password || '', user.password_hash))) {
            return response.status(401).json({ error: 'Email or password is incorrect.' });
        }
        if (!user.email_verified) {
            return response.status(403).json({ error: 'Please verify your email before logging in.' });
        }
        if (!user.approved) {
            return response.status(403).json({ error: 'Your account is waiting for administrator approval.' });
        }
        response.json({
            token: createToken(user),
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        next(error);
    }
});

app.get('/api/auth/verify', async (request, response, next) => {
    try {
        const token = String(request.query.token || '');
        if (!token) {
            return response.status(400).send('Verification token is missing.');
        }
        const [result] = await pool.execute(
            'UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL WHERE verification_token = ? AND verification_expires > NOW()',
            [token]
        );
        if (!result.affectedRows) {
            return response.status(400).send('This verification link is invalid or expired.');
        }
        response.send('<h1>Email verified</h1><p>Your SylTour email is verified. You can now <a href="/login.html">log in</a>.</p>');
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/verify-otp', authRateLimit, async (request, response, next) => {
    try {
        const email = String(request.body.email || '').trim().toLowerCase();
        const otp = String(request.body.otp || '').trim();
        if (!email || !/^\d{6}$/.test(otp)) {
            return response.status(400).json({ error: 'Enter the 6-digit code sent to your email.' });
        }
        const [result] = await pool.execute(
            'UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL WHERE email = ? AND verification_token = ? AND verification_expires > NOW()',
            [email, otp]
        );
        if (!result.affectedRows) {
            return response.status(400).json({ error: 'The code is incorrect or expired.' });
        }
        response.json({ message: 'Email verified. You can now log in.' });
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/forgot-password', authRateLimit, async (request, response, next) => {
    try {
        const email = String(request.body.email || '').trim().toLowerCase();
        if (!mailer) {
            return response.status(503).json({ error: 'Password reset email is not configured. Set MAIL_USER and MAIL_PASSWORD in .env, then restart the server.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return response.status(400).json({ error: 'Enter a valid email address.' });
        }
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length) {
            const resetToken = String(crypto.randomInt(100000, 1000000));
            await pool.execute(
                'UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE email = ?',
                [resetToken, email]
            );
            try {
                await mailer.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Your SylTour password reset code',
                    text: `Your SylTour password reset code is ${resetToken}. It expires in 10 minutes.`,
                    html: `<p>Your SylTour password reset code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${resetToken}</p><p>This code expires in 10 minutes.</p>`
                });
            } catch (error) {
                console.error('Password reset email delivery failed:', error.message);
                return response.status(502).json({ error: 'We could not deliver the reset code. Check the SMTP settings and server log, then try again.' });
            }
        }
        response.json({ message: 'If an account exists for that email, a reset code has been sent.' });
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/reset-password', authRateLimit, async (request, response, next) => {
    try {
        const email = String(request.body.email || '').trim().toLowerCase();
        const otp = String(request.body.otp || '').trim();
        const password = String(request.body.password || '');
        if (!email || !/^\d{6}$/.test(otp) || password.length < 8) {
            return response.status(400).json({ error: 'Enter your email, 6-digit code, and a password of at least 8 characters.' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE email = ? AND reset_token = ? AND reset_expires > NOW()',
            [passwordHash, email, otp]
        );
        if (!result.affectedRows) {
            return response.status(400).json({ error: 'The reset code is incorrect or expired.' });
        }
        response.json({ message: 'Password changed successfully. You can now log in.' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/auth/me', authenticate, async (request, response, next) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, role, approved FROM users WHERE id = ?',
            [request.user.id]
        );
        if (!users[0]) {
            return response.status(404).json({ error: 'User not found.' });
        }
        response.json({ user: users[0] });
    } catch (error) {
        next(error);
    }
});

app.get('/api/attractions/:id', async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        if (!Number.isSafeInteger(id) || id < 1) {
            return response.status(400).json({ error: 'Invalid attraction ID.' });
        }
        const [attractions] = await pool.execute(
            'SELECT id, name, category, location, description, full_details, image_url FROM attractions WHERE id = ? AND approved = 1',
            [id]
        );
        if (!attractions[0]) {
            return response.status(404).json({ error: 'Attraction not found.' });
        }
        response.json({ attraction: attractions[0] });
    } catch (error) {
        next(error);
    }
});

app.get('/api/attractions', async (request, response, next) => {
    try {
        const [attractions] = await pool.execute(
            'SELECT id, name, category, location, description, image_url FROM attractions WHERE approved = 1 ORDER BY name'
        );
        response.json({ attractions });
    } catch (error) {
        next(error);
    }
});

app.post('/api/bookings', authenticate, async (request, response, next) => {
    try {
        const attractionId = Number(request.body.attraction_id);
        const requestType = String(request.body.request_type || '').trim();
        const details = String(request.body.details || '').trim();
        const allowedTypes = ['trip', 'guide', 'hotel'];
        if (!Number.isInteger(attractionId) || attractionId < 1 || !allowedTypes.includes(requestType) || !details) {
            return response.status(400).json({ error: 'Choose an attraction, request type, and provide details.' });
        }
        const [attractions] = await pool.execute(
            'SELECT id FROM attractions WHERE id = ? AND approved = 1',
            [attractionId]
        );
        if (!attractions.length) {
            return response.status(400).json({ error: 'That attraction is not available.' });
        }
        const [result] = await pool.execute(
            'INSERT INTO bookings (user_id, attraction_id, request_type, details, status) VALUES (?, ?, ?, ?, ?)',
            [request.user.id, attractionId, requestType, details, 'pending']
        );
        response.status(201).json({ message: 'Your request was submitted for review.', id: result.insertId });
    } catch (error) {
        next(error);
    }
});

app.get('/api/bookings', authenticate, async (request, response, next) => {
    try {
        const [bookings] = await pool.execute(
            `SELECT b.id, b.request_type, b.details, b.status, b.created_at,
                    a.name AS attraction_name, a.location AS attraction_location
             FROM bookings b
             JOIN attractions a ON a.id = b.attraction_id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [request.user.id]
        );
        response.json({ bookings });
    } catch (error) {
        next(error);
    }
});

app.get('/api/admin/bookings', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const [bookings] = await pool.execute(
            `SELECT b.id, b.request_type, b.details, b.status, b.created_at,
                    u.name AS user_name, u.email AS user_email,
                    a.name AS attraction_name, a.location AS attraction_location
             FROM bookings b
             JOIN users u ON u.id = b.user_id
             JOIN attractions a ON a.id = b.attraction_id
             ORDER BY b.created_at DESC`
        );
        response.json({ bookings });
    } catch (error) {
        next(error);
    }
});

app.patch('/api/admin/bookings/:id/status', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const status = String(request.body.status || '');
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return response.status(400).json({ error: 'Invalid booking status.' });
        }
        const [result] = await pool.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, Number(request.params.id)]
        );
        if (!result.affectedRows) {
            return response.status(404).json({ error: 'Booking not found.' });
        }
        response.json({ message: 'Booking status updated.' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/admin/users', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, role, approved, created_at FROM users ORDER BY created_at DESC'
        );
        response.json({ users });
    } catch (error) {
        next(error);
    }
});

app.patch('/api/admin/users/:id/approval', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const [result] = await pool.execute(
            'UPDATE users SET approved = ? WHERE id = ?',
            [request.body.approved ? 1 : 0, Number(request.params.id)]
        );
        if (!result.affectedRows) {
            return response.status(404).json({ error: 'User not found.' });
        }
        response.json({ message: request.body.approved ? 'User approved.' : 'User approval revoked.' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/admin/attractions', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const [attractions] = await pool.execute('SELECT * FROM attractions ORDER BY created_at DESC');
        response.json({ attractions });
    } catch (error) {
        next(error);
    }
});

app.post('/api/admin/attractions', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const { name, category, location, description, full_details, image_url } = request.body;
        if (!name || !category || !location || !description) {
            return response.status(400).json({ error: 'All attraction fields are required.' });
        }
        if (full_details !== undefined && full_details !== null && typeof full_details !== 'string') {
            return response.status(400).json({ error: 'Full details must be text.' });
        }
        const fullDetails = typeof full_details === 'string' ? full_details.trim() : '';
        if (fullDetails.length > 50000) {
            return response.status(400).json({ error: 'Full details must be 50,000 characters or fewer.' });
        }
        const [result] = await pool.execute(
            'INSERT INTO attractions (name, category, location, description, full_details, image_url, approved) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [name.trim(), category.trim(), location.trim(), description.trim(), fullDetails || null, image_url || null]
        );
        response.status(201).json({ id: result.insertId });
    } catch (error) {
        next(error);
    }
});

app.patch('/api/admin/attractions/:id', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const { name, category, location, description, full_details, image_url } = request.body;
        if (!name || !category || !location || !description) {
            return response.status(400).json({ error: 'All attraction fields are required.' });
        }
        if (full_details !== undefined && full_details !== null && typeof full_details !== 'string') {
            return response.status(400).json({ error: 'Full details must be text.' });
        }
        const fullDetails = typeof full_details === 'string' ? full_details.trim() : '';
        if (fullDetails.length > 50000) {
            return response.status(400).json({ error: 'Full details must be 50,000 characters or fewer.' });
        }
        const [result] = await pool.execute(
            'UPDATE attractions SET name = ?, category = ?, location = ?, description = ?, full_details = ?, image_url = ? WHERE id = ?',
            [name.trim(), category.trim(), location.trim(), description.trim(), fullDetails || null, image_url || null, Number(request.params.id)]
        );
        if (!result.affectedRows) {
            return response.status(404).json({ error: 'Attraction not found.' });
        }
        response.json({ message: 'Attraction updated.' });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/admin/attractions/:id', authenticate, requireAdmin, async (request, response, next) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM attractions WHERE id = ?',
            [Number(request.params.id)]
        );
        if (!result.affectedRows) {
            return response.status(404).json({ error: 'Attraction not found.' });
        }
        response.json({ message: 'Attraction deleted.' });
    } catch (error) {
        next(error);
    }
});

app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function startServer() {
    await pool.query('SELECT 1');
    await pool.query('ALTER TABLE attractions ADD COLUMN IF NOT EXISTS full_details LONGTEXT NULL');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) NOT NULL DEFAULT 0');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(128) NULL');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires DATETIME NULL');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(6) NULL');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires DATETIME NULL');
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
        const normalizedEmail = adminEmail.trim().toLowerCase();
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
        if (!users.length) {
            const passwordHash = await bcrypt.hash(adminPassword, 12);
            await pool.execute(
                'INSERT INTO users (name, email, password_hash, role, approved, email_verified) VALUES (?, ?, ?, ?, 1, 1)',
                ['Administrator', normalizedEmail, passwordHash, 'admin']
            );
        }
    }
    app.listen(port, () => {
        console.log(`SylTour server running at http://localhost:${port}`);
    });
}

startServer().catch(error => {
    console.error('Unable to connect to MySQL:', error.message);
    process.exitCode = 1;
});
