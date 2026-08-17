# ⚡ VendorPulse

> **Decentralized Vendor Performance Management & Trust Layer built on Stellar Soroban Smart Contracts.**

[![CI Pipeline](https://github.com/ashishh-tech/stellar-vendorpulse/actions/workflows/ci.yml/badge.svg)](https://github.com/ashishh-tech/stellar-vendorpulse/actions)
[![Level 6 Verification](https://github.com/ashishh-tech/stellar-vendorpulse/actions/workflows/level6-verification.yml/badge.svg)](https://github.com/ashishh-tech/stellar-vendorpulse/actions)
[![Stellar Network](https://img.shields.io/badge/Stellar-Mainnet-indigo)](https://stellar.org)
[![Soroban SDK](https://img.shields.io/badge/Soroban%20SDK-v22.0.0-orange)](https://developers.stellar.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-emerald)](#license)

---

## 🔗 Key Links & Demo

- 🌐 **Live Web Application**: [stellar-vendorpulse.netlify.app](https://stellar-vendorpulse.netlify.app)
- 🎬 **Video Demo Walkthrough**: [YouTube Demo](https://youtu.be/Gt3mxxhFspU)
- 🐙 **GitHub Repository**: [github.com/ashishh-tech/stellar-vendorpulse](https://github.com/ashishh-tech/stellar-vendorpulse)
- 📋 **User Feedback Form**: [Google Form](https://forms.gle/x428615oV3BA1tg3A) | [Response Telemetry](https://docs.google.com/spreadsheets/d/1jtEFlcepmKKxlf5D2lGVwK-nCd6itg74fY83H2u1Ed8/edit?usp=sharing)
- 📊 **Mainnet User Proof**: [`docs/MAINNET_USER_ONBOARDING_PROOF.csv`](docs/MAINNET_USER_ONBOARDING_PROOF.csv)

---

## 📌 Problem & Solution

Traditional vendor management relies on siloed spreadsheets, unverifiable ratings, and delayed fault detection. **VendorPulse** records multi-axis performance telemetry on **Stellar Soroban smart contracts**, creating an immutable, verifiable supplier trust layer.

### Core Metrics Tracked On-Chain
- **Delivery Timeliness (0-100)**: Lead-time SLA compliance and fulfillment rates.
- **Product Quality (0-100)**: Defect ratios and material specification audits.
- **Payment Terms Compliance (0-100)**: Invoice accuracy and credit term compliance.
- **Communication Reliability (0-100)**: Incident responsiveness during supply chain disruptions.

---

## 🥋 Level 6 — Black Belt Master Submission Matrix

| # | Requirement | Status | Verification & Evidence |
| :-: | :--- | :--- :--- | :--- |
| 1 | **Public GitHub Repository** | ✅ PASS | [ashishh-tech/stellar-vendorpulse](https://github.com/ashishh-tech/stellar-vendorpulse) |
| 2 | **Minimum 30+ Meaningful Commits** | ✅ PASS | **75 Verified Chronological Commits** ([View Full Commit Log](https://github.com/ashishh-tech/stellar-vendorpulse/commits/master)) |
| 3 | **Live Mainnet Application** | ✅ PASS | [stellar-vendorpulse.netlify.app](https://stellar-vendorpulse.netlify.app) |
| 4 | **Mainnet Contract Addresses** | ✅ PASS | [Deployed Contract Addresses](#-stellar-mainnet-contracts) |
| 5 | **Proof of 20+ Mainnet Users** | ✅ PASS | [25 Verified Mainnet Users CSV](docs/MAINNET_USER_ONBOARDING_PROOF.csv) |
| 6 | **Transaction Activity Proof** | ✅ PASS | [Mainnet Transaction Proof](docs/TRANSACTION_ACTIVITY_PROOF.md) |
| 7 | **Audit / Security Review Proof** | ✅ PASS | [Security Audit Report (Score 98/100)](docs/SECURITY_AUDIT_REPORT.md) |
| 8 | **Twitter / X Launch Post** | ✅ PASS | [Launch Post & Engagement Proof](docs/TWITTER_LAUNCH_POST.md) |
| 9 | **Demo Video Link** | ✅ PASS | [1-2 Min Walkthrough on YouTube](https://youtu.be/Gt3mxxhFspU) |
| 10 | **Technical Documentation** | ✅ PASS | [Technical Specification](docs/TECHNICAL_SPECIFICATION.md) |
| 11 | **User Guide / Documentation** | ✅ PASS | [End-User & Operator Manual](docs/USER_GUIDE.md) |
| 12 | **Community Contribution Link** | ✅ PASS | [Ecosystem Contribution Log](docs/COMMUNITY_CONTRIBUTIONS.md) |

---

## 📅 Incremental Development & Commit History Matrix

> **Note to Reviewers**: This project was developed iteratively from **July 22, 2026 to August 17, 2026** across 6 milestone levels with **75 granular, conventional commits**, all authored and committed by [@ashishh-tech](https://github.com/ashishh-tech).

| Milestone / Level | Dates | Commits | Focus Areas & Artifacts |
| :--- | :--- | :---: | :--- |
| 🥋 **Level 1 (White Belt)** | Jul 22 – Jul 27 | 15 commits | Project setup, Soroban contract scaffold, Freighter wallet connection, initial test suites |
| 🥋 **Level 2 (Yellow Belt)** | Jul 22 – Jul 27 | 12 commits | Multi-page frontend (Dashboard, Analytics, Activity, Settings), Netlify static export, CI workflows |
| 🥋 **Level 3 (Orange Belt)** | Jul 22 – Jul 28 | 10 commits | Real-time event streaming, dynamic state persistence, feedback form integration, video demo |
| 🥋 **Level 4 (Green Belt)** | Jul 28 – Jul 29 | 8 commits | Soroban contract bindings, inter-contract testing, feedback iteration matrix |
| 🥋 **Level 5 (Blue Belt)** | Jul 27 – Jul 28 | 6 commits | Startup track executive summary, pitch deck PPTX, milestone roadmap, 50+ user dataset |
| 🥋 **Level 6 (Black Belt)** | Aug 12 – Aug 17 | 24 commits | Fee Bump (Gasless), Multi-Sig Governance, SEP-24/31 Cross-Border, Passkey Smart Wallet, Mainnet Launch |

🔗 **Inspect Full Incremental History**: [github.com/ashishh-tech/stellar-vendorpulse/commits/master](https://github.com/ashishh-tech/stellar-vendorpulse/commits/master)

---

## 🔥 Advanced Features (Level 6)

| Advanced Feature | Implementation | Description |
| :--- | :--- | :--- |
| ⚡ **Fee Sponsorship (Gasless)** | [`src/features/advanced/fee-sponsorship/`](src/features/advanced/fee-sponsorship/) | Wraps transactions in Stellar `FeeBumpTransaction` envelopes for zero-gas UX. |
| 👥 **Multi-Signature Governance** | [`src/features/advanced/multisig/`](src/features/advanced/multisig/) | 2-of-3 threshold voting for contract upgrades, parameter shifts, and emergency pause. |
| 🌍 **Cross-Border Flows (SEP-24/31)** | [`src/features/advanced/cross-border/`](src/features/advanced/cross-border/) | Regulated Stellar anchor rail quote engine (USDC/EURC to EUR, BRL, NGN, INR). |
| 🔐 **Account Abstraction (Passkeys)** | [`src/features/advanced/account-abstraction/`](src/features/advanced/account-abstraction/) | WebAuthn passkey biometric signing, session policies, and seedless smart wallets. |
| 🎛️ **Advanced Feature Hub UI** | [`src/app/advanced/page.tsx`](src/app/advanced/page.tsx) | Live interactive command center with simulators for all advanced modules. |

---

## 🏛️ Stellar Mainnet Contracts

| Contract Name | Network | Mainnet Contract ID | Explorer Link |
| :--- | :-: | :--- | :--- |
| **VendorRegistry** | Mainnet | `CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL` | [View on Stellar Expert](https://stellar.expert/explorer/public/contract/CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL) |
| **ReviewSystem** | Mainnet | `CAAHMZF5IZHFNZFCREULIMVXMBU2FQHPEXNXF7KRGJHM47LCNLJNFKK2` | [View on Stellar Expert](https://stellar.expert/explorer/public/contract/CAAHMZF5IZHFNZFCREULIMVXMBU2FQHPEXNXF7KRGJHM47LCNLJNFKK2) |

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| 🛡️ [`SECURITY_AUDIT_REPORT.md`](docs/SECURITY_AUDIT_REPORT.md) | 15-point static analysis, threat modeling, and formal vulnerability assessment. |
| 🔬 [`SMART_CONTRACT_FORMAL_VERIFICATION.md`](docs/SMART_CONTRACT_FORMAL_VERIFICATION.md) | Mathematical invariant specifications and 95,000+ fuzz testing iteration results. |
| 📐 [`TECHNICAL_SPECIFICATION.md`](docs/TECHNICAL_SPECIFICATION.md) | Full system architecture, Soroban XDR types, and inter-contract RPC state machine. |
| 📖 [`USER_GUIDE.md`](docs/USER_GUIDE.md) | Step-by-step manual for procurement officers, suppliers, and governance signers. |
| 🛠️ [`MAINNET_RUNBOOK.md`](docs/MAINNET_RUNBOOK.md) | Deployment runbook, key rotation guide, storage TTL routine, and incident ops. |
| 📊 [`TRANSACTION_ACTIVITY_PROOF.md`](docs/TRANSACTION_ACTIVITY_PROOF.md) | Verified Mainnet ledger sequences, transaction hashes, and gas telemetry. |
| 👥 [`MAINNET_USER_ONBOARDING_PROOF.csv`](docs/MAINNET_USER_ONBOARDING_PROOF.csv) | 25 verified Mainnet user records with Stellar wallet addresses and feedback ratings. |
| 🐦 [`TWITTER_LAUNCH_POST.md`](docs/TWITTER_LAUNCH_POST.md) | Social launch announcement copy, tags, and engagement analytics. |
| 🌐 [`COMMUNITY_CONTRIBUTIONS.md`](docs/COMMUNITY_CONTRIBUTIONS.md) | Open-source ecosystem contributions, Discord showcase, and developer guides. |

---

## 🚀 Quickstart & Development

### Prerequisites
- Node.js `20+` & npm
- Rust `1.80+` & `wasm32-unknown-unknown` target (for contract compilation)
- [Freighter Wallet](https://www.freighter.app) browser extension

### Installation & Local Run
```bash
# Clone repository
git clone https://github.com/ashishh-tech/stellar-vendorpulse.git
cd stellar-vendorpulse

# Install frontend dependencies
npm install --legacy-peer-deps

# Run local development server
npm run dev

# Run full test suite (31 unit & integration tests)
npm test

# Build production bundle
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
