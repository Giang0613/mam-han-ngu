# Reporting a security issue

Use **Security → Report a vulnerability** if private reporting is enabled on the
repository. Otherwise, open an issue asking the maintainer for a private contact
channel without publishing exploit details, credentials, or learner data. The
project does not currently offer a response-time guarantee or a bounty program.

Include the affected version or commit, component, minimal reproduction, and
impact. Test only systems and accounts you are authorized to use.

## Deployment scope

This edition uses browser-cookie profiles and server-local SQLite storage.
Settings supports an explicit recovery credential. Account sign-in and cross-server sync are not implemented. The setup
instructions bind to `127.0.0.1` for local use. An Internet-facing deployment needs
deployment-specific authentication, trusted proxy configuration, protected backups and provider budgets. Per-profile, client-scope and installation request caps are implemented; see [runtime safeguards](docs/BACKEND_RELIABILITY.md).

AI and Azure keys must stay on the server. Do not commit `.env.local`, databases,
recordings, or private backups. Only the reviewed
community source belongs in the public repository.
