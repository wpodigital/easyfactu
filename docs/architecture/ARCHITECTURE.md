# Architecture overview — Multiplatform App (Web-first)

Goal
- Single codebase (TypeScript) with a web-first approach (PWA) and native packaging for Android/iOS (Capacitor) and Desktop (Electron).

High-level components
- Frontend (Client): React + TypeScript (PWA)
  - Capacitor for mobile (Android/iOS)
  - Electron for Windows/macOS desktop
  - Plugins for secure storage / keystore access for client-side signing
- Backend (optional but recommended): Node.js + TypeScript (Express/NestJS)
  - Canonicalization, helper endpoints, verification, optional gateway to HSM/KMS
  - Only used for non-user-private-key operations; primary signing is client-side per user requirement
- Storage: PostgreSQL for metadata, S3/Blob for signed packages
- Security: TLS, OAuth2/OIDC, Keychain/Keystore usage, offline capability

Key design decisions made
- Web-first (PWA) + Capacitor + Electron
- Every user must sign with their own certificate on-device (client-side signing)
- Offline-first capability: all signing flows must be possible without network connectivity

Offline strategy
- Store minimal signing client logic and canonicalization code on-device
- Local secure storage for private keys/cert handling via OS keystore plugins (Keychain / Android Keystore / Windows Certificate Store)
- Queue/sync system for jobs requiring server interaction (timestamping, audit) when online

APIs (summary)
- openapi.yaml in repo defines REST endpoints for uploads, verification, optional server-assisted tasks

Next steps
- Create OpenAPI spec + minimal backend scaffold + PWA skeleton
- Implement native plugin integration tests for key access and offline signing
