# SylTour

SylTour is a Node.js, Express, and MySQL travel site for exploring Sylhet, managing accounts, and requesting travel services.

## Requirements

- Node.js 18 or later
- MariaDB 10.4 or later
- SMTP credentials for email verification and password reset

## Local setup

1. Create the database and tables, and load the sample Sylhet destinations, by importing `database/schema.sql` with MySQL Workbench, or run `mysql -u root -p < database/schema.sql` from Command Prompt. The sample destinations are inserted only when a destination with that name does not already exist.
2. Copy `.env.example` to `.env` and set the database, email, admin, and application URL values for your environment. Set `JWT_SECRET` to a unique, long random value.
3. Install dependencies with `npm install`.
4. Start the site with `npm.cmd start` on Windows, or `npm start` on macOS/Linux.
5. Open the configured `APP_URL` in a browser. The initial administrator account is created on startup when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured.

For Gmail, enable 2-Step Verification and use a Google App Password for `MAIL_PASSWORD` (not your regular Gmail password). After changing `.env`, restart the server. Check the recipient's spam folder too; SMTP delivery errors are shown on the password-reset page and logged in the server terminal.

Do not deploy with example credentials or expose `.env`, `data.json`, or server logs publicly.

The Sylhet, Sunamganj, Habiganj, and Moulvibazar district guides are available at `sylhet.html`, `sunamganj.html`, `habiganj.html`, and `moulvibazar.html`; each can be opened from its matching district in the homepage filter. Destination cards link to a shared `attraction.html` details page. The first five featured destinations on each district page include starter long-form visitor details; admins can edit or replace those details in the Admin Dashboard, then save them on each attraction card or when adding a new attraction. The server adds the `full_details` column to existing databases at startup; new databases also receive it from `database/schema.sql`. To add district sample destinations to an existing database, re-import `database/schema.sql`; seed inserts skip destination names that are already present.
