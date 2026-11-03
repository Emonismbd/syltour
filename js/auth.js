document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('signupRole');
    const adminNotice = document.getElementById('adminNotice');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const signupStatus = document.getElementById('signupStatus');
    const loginStatus = document.getElementById('loginStatus');
    const passwordInput = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    const showStatus = (element, message, type) => {
        if (!element) return;
        element.textContent = message;
        element.className = `auth-status ${type}`;
    };
    const setSubmitLoading = (form, isLoading, label) => {
        const button = form.querySelector('.auth-submit');
        if (!button) return;
        const card = form.closest('.auth-card');
        if (isLoading) {
            button.dataset.originalContent = button.innerHTML;
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.innerHTML = `<span class="auth-button-spinner" aria-hidden="true"></span><span>${label}</span>`;
            if (card) card.classList.add('is-submitting');
            return;
        }
        button.disabled = false;
        button.removeAttribute('aria-busy');
        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
            delete button.dataset.originalContent;
        }
        if (card) card.classList.remove('is-submitting');
    };
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

    if (passwordInput && strengthBar && strengthLabel) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const checks = {
                length: password.length >= 8,
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                number: /\d/.test(password),
                symbol: /[^A-Za-z0-9]/.test(password)
            };
            Object.entries(checks).forEach(([name, passed]) => {
                const requirement = document.querySelector(`[data-requirement="${name}"]`);
                requirement.classList.toggle('passed', passed);
            });
            const score = Object.values(checks).filter(Boolean).length;
            const levels = ['Enter a password', 'Very weak', 'Weak', 'Medium', 'Strong', 'Very strong'];
            strengthBar.style.width = `${score * 20}%`;
            strengthBar.dataset.level = score;
            strengthLabel.textContent = levels[score];
            strengthLabel.dataset.level = score;
        });
    }

    if (roleSelect && adminNotice) {
        const updateAdminNotice = () => {
            adminNotice.classList.toggle('visible', roleSelect.value === 'admin');
        };
        roleSelect.addEventListener('change', updateAdminNotice);
        updateAdminNotice();
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (roleSelect.value === 'admin') {
                showStatus(signupStatus, 'Admin signup requires an invitation or approval from an existing administrator.', 'error');
                return;
            }
            const form = new FormData(signupForm);
            setSubmitLoading(signupForm, true, 'Creating your account...');
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(form.entries()))
                });
                const data = await response.json();
                if (!response.ok) {
                    setSubmitLoading(signupForm, false);
                    showStatus(signupStatus, data.error || 'Unable to create account.', 'error');
                    return;
                }
                showStatus(signupStatus, data.message, 'success');
                window.location.href = `verify.html?email=${encodeURIComponent(form.get('email'))}`;
            } catch (error) {
                console.error('Unable to create account:', error);
                setSubmitLoading(signupForm, false);
                showStatus(signupStatus, 'Cannot connect to the server. Start it with npm.cmd start and try again.', 'error');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const form = new FormData(loginForm);
            setSubmitLoading(loginForm, true, 'Signing you in...');
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(form.entries()))
                });
                const data = await response.json();
                if (!response.ok) {
                    setSubmitLoading(loginForm, false);
                    showStatus(loginStatus, data.error || 'Unable to log in.', 'error');
                    return;
                }
                localStorage.setItem('syltourToken', data.token);
                localStorage.setItem('syltourUser', JSON.stringify(data.user));
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Unable to log in:', error);
                setSubmitLoading(loginForm, false);
                showStatus(loginStatus, 'Cannot connect to the server. Start it with npm.cmd start and try again.', 'error');
            }
        });
    }
});
