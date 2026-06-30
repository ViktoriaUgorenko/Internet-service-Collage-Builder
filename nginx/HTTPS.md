## HTTPS in local Docker

The `nginx` service now serves:

- `http://localhost` -> redirects to HTTPS
- `https://localhost` -> main app

Certificates are loaded from:

- `nginx/ssl/cert.pem`
- `nginx/ssl/key.pem`

If your browser shows a certificate warning, this is expected for self-signed local certs.

### Replace with your own certificate

Put your real certificate and key into:

- `nginx/ssl/cert.pem`
- `nginx/ssl/key.pem`

Then restart nginx:

```bash
docker compose up -d --force-recreate nginx
```
