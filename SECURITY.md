# Security policy

Report suspected vulnerabilities privately through the contact method on the repository owner's GitHub profile. Do not include credentials, real sensor exports, or personal data in a public issue.

The demonstration API has no built-in user authentication and is intended for local, single-user evaluation. Its SQLite database stores prediction inputs and outputs, so the runtime directory should remain private and must not be committed. Before internet exposure, add record ownership and authentication, then place it behind TLS, request size limits, and rate limiting. Restrict artifact write access and verify the source of every model artifact; joblib files must never be loaded from untrusted sources.

## Dependency audit status

The Phase 5 mobile audit on 6 October 2026 found three advisories in transitive Expo/React Native build and test tooling: `node-forge`, `braces`, and `sprintf-js`. The registry did not yet publish the patched versions named by those advisories (`node-forge` 1.4.1, `braces` 3.0.4, and `sprintf-js` 1.1.4), so forcing nonexistent versions would make clean installs impossible. Two other findings were resolved with workspace overrides for `uuid` 11.1.1 and `decode-uri-component` 0.5.0.

The remaining packages are reached through the local Expo CLI, Metro, and Jest dependency graph; the portfolio has no hosted mobile service or remote build pipeline. Re-run `pnpm audit --prod` from `mobile/` when upstream releases become available, then remove this exception after the lockfile is updated and all quality gates pass.
