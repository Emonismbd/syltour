document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('syltourToken');
    const status = document.getElementById('adminStatus');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const request = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed.');
        return data;
    };

    try {
        const me = await request('/api/auth/me');
        if (me.user.role !== 'admin') throw new Error('Administrator access required.');
        status.textContent = `Signed in as ${me.user.email}`;
        await loadUsers(request);
        await loadAttractions(request);
        await loadBookings(request);
    } catch (error) {
        localStorage.removeItem('syltourToken');
        status.textContent = error.message;
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    }

    async function loadUsers(apiRequest) {
        const { users } = await apiRequest('/api/admin/users');
        document.getElementById('userList').innerHTML = users.map(user => `
            <div class="admin-user">
                <span><strong>${escapeHtml(user.name)}</strong><br>${escapeHtml(user.email)} · ${user.role}</span>
                <button class="filter-btn" data-user-id="${user.id}" data-approved="${user.approved ? '0' : '1'}">
                    ${user.approved ? 'Revoke' : 'Approve'}
                </button>
            </div>
        `).join('') || 'No users yet.';
        document.querySelectorAll('[data-user-id]').forEach(button => {
            button.addEventListener('click', async () => {
                await apiRequest(`/api/admin/users/${button.dataset.userId}/approval`, {
                    method: 'PATCH',
                    body: JSON.stringify({ approved: button.dataset.approved === '1' })
                });
                await loadUsers(apiRequest);
            });
        });
    }

    document.getElementById('attractionForm').addEventListener('submit', async event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        try {
            await request('/api/admin/attractions', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(form.entries()))
            });
            document.getElementById('attractionStatus').textContent = 'Attraction added successfully.';
            event.currentTarget.reset();
            await loadAttractions(request);
        } catch (error) {
            document.getElementById('attractionStatus').textContent = error.message;
        }
    });

    async function loadAttractions(apiRequest) {
        const { attractions } = await apiRequest('/api/admin/attractions');
        document.getElementById('attractionList').innerHTML = attractions.map(attraction => `
            <article class="admin-attraction" data-attraction-id="${attraction.id}">
                ${attraction.image_url ? `<img src="${escapeAttribute(attraction.image_url)}" alt="${escapeAttribute(attraction.name)}">` : '<div class="admin-attraction-no-image">No image</div>'}
                <div class="admin-attraction-details">
                    <h3>${escapeHtml(attraction.name)}</h3>
                    <p>${escapeHtml(attraction.category)} · ${escapeHtml(attraction.location)}</p>
                    <p>${escapeHtml(attraction.description)}</p>
                    <label class="admin-full-details-label">
                        Full visitor details
                        <textarea class="admin-attraction-full-details" rows="6" maxlength="50000" placeholder="Add history, travel guidance, visiting hours, fees, and other useful details...">${escapeHtml(attraction.full_details || '')}</textarea>
                    </label>
                    <a href="attraction.html?id=${encodeURIComponent(attraction.id)}" target="_blank" rel="noopener noreferrer">Preview details page</a>
                    <div class="admin-attraction-actions">
                        <button class="filter-btn save-attraction-details" type="button">Save full details</button>
                        <button class="filter-btn edit-attraction" type="button">Edit</button>
                        <button class="filter-btn danger-button delete-attraction" type="button">Delete</button>
                    </div>
                </div>
            </article>
        `).join('') || 'No attractions yet.';

        document.querySelectorAll('.delete-attraction').forEach(button => {
            button.addEventListener('click', async () => {
                const card = button.closest('[data-attraction-id]');
                if (!window.confirm('Delete this attraction? This cannot be undone.')) return;
                await apiRequest(`/api/admin/attractions/${card.dataset.attractionId}`, { method: 'DELETE' });
                await loadAttractions(apiRequest);
            });
        });

        document.querySelectorAll('.save-attraction-details').forEach(button => {
            button.addEventListener('click', async () => {
                const card = button.closest('[data-attraction-id]');
                const attraction = attractions.find(item => String(item.id) === card.dataset.attractionId);
                const fullDetails = card.querySelector('.admin-attraction-full-details').value;
                await apiRequest(`/api/admin/attractions/${attraction.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        name: attraction.name,
                        category: attraction.category,
                        location: attraction.location,
                        description: attraction.description,
                        full_details: fullDetails,
                        image_url: attraction.image_url || ''
                    })
                });
                document.getElementById('attractionStatus').textContent = `Full details saved for ${attraction.name}.`;
                await loadAttractions(apiRequest);
            });
        });

        document.querySelectorAll('.edit-attraction').forEach(button => {
            button.addEventListener('click', async () => {
                const card = button.closest('[data-attraction-id]');
                const attraction = attractions.find(item => String(item.id) === card.dataset.attractionId);
                const updated = {
                    name: window.prompt('Attraction name:', attraction.name),
                    category: window.prompt('Category:', attraction.category),
                    location: window.prompt('Location:', attraction.location),
                    description: window.prompt('Description:', attraction.description),
                    image_url: window.prompt('Image URL:', attraction.image_url || '')
                };
                if (Object.values(updated).some(value => value === null)) return;
                updated.full_details = attraction.full_details || '';
                await apiRequest(`/api/admin/attractions/${attraction.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(updated)
                });
                await loadAttractions(apiRequest);
            });
        });
    }

    async function loadBookings(apiRequest) {
        const { bookings } = await apiRequest('/api/admin/bookings');
        document.getElementById('bookingList').innerHTML = bookings.map(booking => `
            <article class="booking-item" data-booking-id="${booking.id}">
                <div>
                    <strong>${escapeHtml(booking.attraction_name)}</strong>
                    <span>${escapeHtml(booking.user_name)} · ${escapeHtml(booking.user_email)}</span>
                    <span>${escapeHtml(booking.request_type)} · ${escapeHtml(booking.created_at)}</span>
                    <p>${escapeHtml(booking.details)}</p>
                </div>
                <div class="booking-actions">
                    <span class="booking-status ${escapeHtml(booking.status)}">${escapeHtml(booking.status)}</span>
                    ${booking.status === 'pending' ? `
                        <button class="filter-btn" data-booking-status="approved">Approve</button>
                        <button class="filter-btn danger-button" data-booking-status="rejected">Reject</button>
                    ` : ''}
                </div>
            </article>
        `).join('') || '<p>No booking requests yet.</p>';

        document.querySelectorAll('[data-booking-status]').forEach(button => {
            button.addEventListener('click', async () => {
                const card = button.closest('[data-booking-id]');
                await apiRequest(`/api/admin/bookings/${card.dataset.bookingId}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: button.dataset.bookingStatus })
                });
                await loadBookings(apiRequest);
            });
        });
    }

});

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
