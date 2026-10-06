# Security policy

Report suspected vulnerabilities privately through the contact method on the repository owner's GitHub profile. Do not include credentials, real sensor exports, or personal data in a public issue.

The demonstration API has no built-in user authentication and is intended for local or controlled evaluation. Before internet exposure, place it behind TLS, authentication, request size limits, and rate limiting. Restrict artifact write access and verify the source of every model artifact; joblib files must never be loaded from untrusted sources.
