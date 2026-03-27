# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this repository or the deployed site
at london.js.org, please use GitHub's private vulnerability reporting feature:

<https://github.com/londonjs/website/security/advisories/new>

**Please do NOT open a public GitHub issue for security vulnerabilities.**

### Alternative Contact

If GitHub's vulnerability reporting is not suitable for your disclosure, you may
contact the maintainers through the [London.js Meetup group](https://www.meetup.com/london-js/).

## Response Timeline

- We will acknowledge your report within 48 hours
- We will assess the vulnerability within 7 days
- We will fix or mitigate the issue within 30 days

## Scope

This security policy applies to:

- The `londonjs/website` repository
- The deployed site at london.js.org

## Supported Versions

Only the latest version on the `main` branch is supported for security updates.

## Known Vulnerabilities

The following vulnerabilities are tracked but not actively remediated:

| Package     | Severity | Issue                                                    | Reason                                                        | Status                |
| ----------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------- | --------------------- |
| `smol-toml` | Medium   | DoS via thousands of consecutive commented lines in TOML | Dev dependency only (`markdownlint-cli2`); low practical risk | Tracked by Dependabot |

This table documents accepted risks for transparency. All high and critical severity vulnerabilities are addressed immediately via CI (`npm audit --audit-level=high`).
