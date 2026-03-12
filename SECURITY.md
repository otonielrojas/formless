# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (`master`) | ✅ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it privately:

1. Go to the [Security tab](https://github.com/otonielrojas/formless/security) on GitHub and use **"Report a vulnerability"**
2. Or email directly (contact via GitHub profile)

Please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (if possible)
- Any suggested remediation

You will receive an acknowledgement within **48 hours** and a resolution timeline within **7 days**.

## Scope

### In scope
- Unauthorized access to workspace data (tenant isolation bypass)
- AI prompt injection via intake submissions
- XSS or injection vulnerabilities in the admin UI
- Exposure of API keys or service role credentials
- RLS bypass in Supabase queries

### Out of scope
- Social engineering or phishing attacks
- Issues in third-party services (Supabase, Groq, Vercel)
- Denial of service via excessive intake submissions (rate limiting is a roadmap item)

## Disclosure Policy

Once a fix is deployed, the vulnerability will be disclosed in the [GitHub Security Advisories](https://github.com/otonielrojas/formless/security/advisories) with credit to the reporter (unless they prefer to remain anonymous).
