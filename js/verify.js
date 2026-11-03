document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('otpForm');
    const emailField = document.getElementById('otpEmail');
    const codeField = document.getElementById('otpCode');
    const status = document.getElementById('verifyStatus');
    const success = document.getElementById('verifySuccess');
    const card = form.closest('.verify-card');
    const button = form.querySelector('.auth-submit');
    const savedEmail = new URLSearchParams(window.location.search).get('email');

    if (savedEmail) emailField.value = savedEmail;
    codeField.focus({ preventScroll: true });

    codeField.addEventListener('input', () => {
        codeField.value = codeField.value.replace(/\D/g, '').slice(0, 6);
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        status.textContent = '';
        status.className = 'auth-status';
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.innerHTML = '<span class="auth-button-spinner" aria-hidden="true"></span><span>Verifying your email…</span>';
        card.classList.add('is-submitting');

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
            });
            const data = await response.json();
            if (!response.ok) {
                status.textContent = data.error || 'Unable to verify your email.';
                status.className = 'auth-status error';
                return;
            }

            button.removeAttribute('aria-busy');
            button.innerHTML = '<span>Verified</span><i class="fas fa-check" aria-hidden="true"></i>';
            form.querySelectorAll('input, button').forEach(field => {
                field.disabled = true;
            });
            status.textContent = '';
            success.hidden = false;
            card.classList.remove('is-submitting');
            card.classList.add('is-verified');
            window.setTimeout(() => {
                window.location.href = 'login.html';
            }, 1600);
        } catch (error) {
            console.error('Unable to verify email:', error);
            status.textContent = 'Cannot connect to the server. Please try again.';
            status.className = 'auth-status error';
        } finally {
            if (success.hidden) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                button.innerHTML = '<span>Verify email</span><i class="fas fa-arrow-right" aria-hidden="true"></i>';
                card.classList.remove('is-submitting');
            }
        }
    });
});
