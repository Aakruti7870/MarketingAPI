# Production domain: gold-etechapp.com

The application is configured to use:

- Public origin: `https://gold-etechapp.com`
- Frontend: Firebase Hosting
- API: Firebase Hosting rewrite `/api/**` -> Cloud Run service `marketingapi` in `asia-south1`

## One-time Firebase setup

After the target Google Cloud project has Firebase Hosting enabled and the app has been deployed:

1. Open Firebase Console -> Hosting -> Add custom domain.
2. Enter `gold-etechapp.com`.
3. Add the Firebase-provided DNS verification and hosting records at the domain registrar/DNS provider.
4. Wait for Firebase to verify the records and provision HTTPS.
5. Optionally add `www.gold-etechapp.com` and configure it to redirect to the apex domain.

## Verification

After DNS and certificate provisioning complete, verify:

- `https://gold-etechapp.com/` loads the GOLD-e AI landing page.
- `https://gold-etechapp.com/pricing` loads pricing.
- `https://gold-etechapp.com/login` loads authentication.
- `https://gold-etechapp.com/api/health` returns the Cloud Run API health response.

The repository cannot bind DNS records by itself; Firebase custom-domain association and DNS changes must be completed in the Firebase project and domain DNS account.
