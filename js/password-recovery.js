document.addEventListener('DOMContentLoaded', () => {
    const showStatus = (element, message, type) => {
        element.textContent = message;
        element.className = `auth-status ${type}`;
    };

    const setLoading = (form, isLoading, label) => {
        const button = form.querySelector('.auth-submit');
        const card = form.closest('.auth-card');
        if (isLoading) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.innerHTML = `<span class="auth-button-spinner" aria-hidden="true"></span><span>${label}</span>`;
            card.classList.add('is-submitting');
            return;
        }
        button.disabled = false;
        button.removeAttribute('aria-busy');
        card.classList.remove('is-submitting');
    };

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        const status = document.getElementById('forgotStatus');
        const success = document.getElementById('forgotSuccess');

        forgotForm.addEventListener('submit', async event => {
            event.preventDefault();
            status.textContent = '';
            status.className = 'auth-status';
            setLoading(forgotForm, true, 'Sending reset code…');

            try {
                const formData = new FormData(forgotForm);
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData.entries()))
                });
                const data = await response.json();
                if (!response.ok) {
                    showStatus(status, data.error || 'Unable to send reset code.', 'error');
                    setLoading(forgotForm, false);
                    forgotForm.querySelector('.auth-submit').innerHTML = '<span>Send reset code</span><i class="fas fa-arrow-right" aria-hidden="true"></i>';
                    return;
                }

                forgotForm.querySelectorAll('input, button').forEach(field => {
                    field.disabled = true;
                });
                success.hidden = false;
                forgotForm.closest('.auth-card').classList.add('is-recovery-success');
                window.setTimeout(() => {
                    window.location.href = `reset-password.html?email=${encodeURIComponent(formData.get('email'))}`;
                }, 1800);
            } catch (error) {
                console.error('Unable to request a password reset:', error);
                showStatus(status, 'Cannot connect to the server. Please try again.', 'error');
                setLoading(forgotForm, false);
                forgotForm.querySelector('.auth-submit').innerHTML = '<span>Send reset code</span><i class="fas fa-arrow-right" aria-hidden="true"></i>';
            }
        });
    }

    const resetForm = document.getElementById('resetForm');
    if (!resetForm) return;

    const emailField = document.getElementById('resetEmail');
    const codeField = document.getElementById('resetOtp');
    const passwordField = document.getElementById('resetPassword');
    const status = document.getElementById('resetStatus');
    const success = document.getElementById('resetSuccess');
    const strengthBar = document.getElementById('resetStrengthBar');
    const strengthLabel = document.getElementById('resetStrengthLabel');
    const savedEmail = new URLSearchParams(window.location.search).get('email');
    if (savedEmail) emailField.value = savedEmail;

    document.querySelectorAll('[data-password-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            const visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
            button.title = visible ? 'Show password' : 'Hide password';
            button.innerHTML = `<i class="fas fa-eye${visible ? '' : '-slash'}"></i>`;
        });
    });

    codeField.addEventListener('input', () => {
        codeField.value = codeField.value.replace(/\D/g, '').slice(0, 6);
    });

    passwordField.addEventListener('input', () => {
        const password = passwordField.value;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password)
        };
        Object.entries(checks).forEach(([name, passed]) => {
            document.querySelector(`[data-reset-requirement="${name}"]`).classList.toggle('passed', passed);
        });
        const score = Object.values(checks).filter(Boolean).length;
        const labels = ['Choose a strong password', 'Very weak', 'Weak', 'Medium', 'Strong', 'Very strong'];
        strengthBar.style.width = `${score * 20}%`;
        strengthBar.dataset.level = score;
        strengthLabel.textContent = labels[score];
        strengthLabel.dataset.level = score;
    });

    resetForm.addEventListener('submit', async event => {
        event.preventDefault();
        status.textContent = '';
        status.className = 'auth-status';
        setLoading(resetForm, true, 'Updating password…');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(resetForm).entries()))
            });
            const data = await response.json();
            if (!response.ok) {
                showStatus(status, data.error || 'Unable to reset your password.', 'error');
                setLoading(resetForm, false);
                resetForm.querySelector('.auth-submit').innerHTML = '<span>Change password</span><i class="fas fa-arrow-right" aria-hidden="true"></i>';
                return;
            }

            const button = resetForm.querySelector('.auth-submit');
            button.removeAttribute('aria-busy');
            button.innerHTML = '<span>Password updated</span><i class="fas fa-check" aria-hidden="true"></i>';
            resetForm.querySelectorAll('input, button').forEach(field => {
                field.disabled = true;
            });
            success.hidden = false;
            const card = resetForm.closest('.auth-card');
            card.classList.remove('is-submitting');
            card.classList.add('is-recovery-success');
            window.setTimeout(() => {
                window.location.href = 'login.html';
            }, 1800);
        } catch (error) {
            console.error('Unable to reset the password:', error);
            showStatus(status, 'Cannot connect to the server. Please try again.', 'error');
            setLoading(resetForm, false);
            resetForm.querySelector('.auth-submit').innerHTML = '<span>Change password</span><i class="fas fa-arrow-right" aria-hidden="true"></i>';
        }
    });
});
