document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('syltourToken');
    const status = document.getElementById('dashboardStatus');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unable to load your account.');
        }
        const roleNames = {
            traveler: 'Traveler Dashboard',
            guide: 'Guide Dashboard',
            business: 'Business Owner Dashboard'
        };
        document.getElementById('dashboardTitle').textContent = roleNames[data.user.role] || 'My Dashboard';
        status.textContent = `Signed in as ${data.user.name} (${data.user.email})`;
        document.getElementById('dashboardMessage').textContent = data.user.role === 'traveler'
            ? 'Plan trips, discover destinations, and request local guide support.'
            : 'Your professional account is active. More management tools will appear after approval.';
        await loadBookingForm();
        await loadBookings();
    } catch (error) {
        localStorage.removeItem('syltourToken');
        status.textContent = error.message;
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    }

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed.');
        return data;
    }

    async function loadBookingForm() {
        const { attractions } = await apiRequest('/api/attractions');
        const select = document.getElementById('bookingAttraction');
        select.innerHTML = attractions.map(item =>
            `<option value="${item.id}">${escapeHtml(item.name)} — ${escapeHtml(item.location)}</option>`
        ).join('') || '<option value="">No destinations available</option>';
    }

    async function loadBookings() {
        const { bookings } = await apiRequest('/api/bookings');
        document.getElementById('bookingList').innerHTML = bookings.map(booking => `
            <article class="booking-item">
                <div>
                    <strong>${escapeHtml(booking.attraction_name)}</strong>
                    <span>${escapeHtml(booking.request_type)} · ${escapeHtml(booking.created_at)}</span>
                    <p>${escapeHtml(booking.details)}</p>
                </div>
                <span class="booking-status ${escapeHtml(booking.status)}">${escapeHtml(booking.status)}</span>
            </article>
        `).join('') || '<p>No requests yet.</p>';
    }

    document.getElementById('bookingForm').addEventListener('submit', async event => {
        event.preventDefault();
        const status = document.getElementById('bookingStatus');
        const form = new FormData(event.currentTarget);
        try {
            const data = await apiRequest('/api/bookings', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(form.entries()))
            });
            status.textContent = data.message;
            status.className = 'form-status success';
            event.currentTarget.reset();
            await loadBookings();
        } catch (error) {
            status.textContent = error.message;
            status.className = 'form-status error';
        }
    });
});

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));
}
