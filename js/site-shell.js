document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.navbar').forEach(navbar => {
        const hamburger = navbar.querySelector('.hamburger');
        const navLinks = navbar.querySelector('.nav-links');
        if (!hamburger || !navLinks) return;

        const token = localStorage.getItem('syltourToken');
        if (token) {
            let user = null;
            try {
                user = JSON.parse(localStorage.getItem('syltourUser') || 'null');
            } catch (error) {
                console.error('Unable to read the signed-in user:', error);
            }

            if (user && typeof user.name === 'string' && user.name.trim()) {
                navLinks.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach(link => link.remove());

                const profileLink = document.createElement('a');
                profileLink.className = 'nav-profile';
                profileLink.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
                profileLink.setAttribute('aria-label', `${user.name.trim()}'s profile`);

                const avatar = document.createElement('span');
                avatar.className = 'nav-profile-avatar';
                avatar.setAttribute('aria-hidden', 'true');
                avatar.textContent = user.name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();

                const name = document.createElement('span');
                name.className = 'nav-profile-name';
                name.textContent = user.name.trim();

                profileLink.append(avatar, name);
                navLinks.appendChild(profileLink);

                let logoutButton = navLinks.querySelector('[data-logout], #logoutButton');
                if (!logoutButton) {
                    logoutButton = document.createElement('button');
                    logoutButton.type = 'button';
                    logoutButton.className = 'btn-cta nav-logout';
                    logoutButton.dataset.logout = 'true';
                    logoutButton.innerHTML = '<i class="fas fa-right-from-bracket" aria-hidden="true"></i> Log out';
                    navLinks.appendChild(logoutButton);
                }
                navLinks.insertBefore(profileLink, logoutButton);
                logoutButton.addEventListener('click', () => {
                    localStorage.removeItem('syltourToken');
                    localStorage.removeItem('syltourUser');
                    window.location.href = 'login.html';
                });
            }
        }

        const toggleMenu = () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', String(isOpen));
            hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        };

        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleMenu();
            }
        });

        navLinks.addEventListener('click', event => {
            if (event.target.closest('a')) {
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.setAttribute('aria-label', 'Open navigation menu');
            }
        });
    });
});
