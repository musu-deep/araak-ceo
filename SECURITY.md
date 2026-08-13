# Security Policy

## Public repository rules

Do not commit production credentials, JWT secrets, database passwords, API tokens, signing keys, customer data, employee records, internal documents, private endpoints, or tenant-specific confidential information.

Use environment variables and protected deployment-secret stores. Keep only placeholder values in `.env.example` files.

## If a secret is exposed

1. Revoke or rotate it immediately.
2. Remove it from active branches and deployment settings.
3. Review repository history and logs for exposure.
4. Redeploy only after replacing the affected credential.

Never place live credentials or personal data in public issues, pull requests, screenshots, logs, or documentation.
