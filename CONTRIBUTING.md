# Contributing to VendorPulse

Thank you for your interest in contributing to **VendorPulse** — the decentralized vendor performance management platform built on Stellar Soroban!

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+
- **Rust** toolchain with `wasm32-unknown-unknown` target
- **Stellar CLI** for contract deployment
- A Stellar wallet (Freighter recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/ashishh-tech/stellar-vendorpulse.git
cd stellar-vendorpulse

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test
```

## 🛠️ How to Contribute

### 1. Report Bugs
- Open an [Issue](https://github.com/ashishh-tech/stellar-vendorpulse/issues) with the `bug` label
- Include: Steps to reproduce, expected behavior, actual behavior, screenshots

### 2. Suggest Features
- Open an [Issue](https://github.com/ashishh-tech/stellar-vendorpulse/issues) with the `enhancement` label
- Describe the use case, proposed solution, and alternatives considered

### 3. Submit Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Ensure all tests pass: `npm run test`
5. Ensure the build succeeds: `npm run build`
6. Commit with descriptive messages: `git commit -m "feat: add vendor batch upload"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request against `master`

### 4. Smart Contract Contributions
- Soroban contracts are in `contracts/` directory
- Run contract tests: `cd contracts && cargo test --workspace`
- Follow Rust/Soroban best practices for storage, auth, and error handling

## 📋 Contribution Areas

| Area | Description | Difficulty |
| :--- | :--- | :-: |
| **Frontend UI** | New dashboard widgets, charts, responsive improvements | 🟢 Easy |
| **Testing** | Additional Vitest/RTL test cases, edge case coverage | 🟢 Easy |
| **Documentation** | README improvements, API docs, user guides | 🟢 Easy |
| **Smart Contracts** | New contract functions, storage optimizations | 🟡 Medium |
| **Wallet Integration** | Additional wallet support, WalletConnect | 🟡 Medium |
| **SEP Integration** | SEP-24/31 anchor flows for USDC payments | 🔴 Advanced |
| **Multi-Sig** | Multi-party approval for vendor status changes | 🔴 Advanced |

## 📐 Code Style

- **TypeScript**: Strict mode, explicit types, no `any`
- **React**: Functional components with hooks
- **Rust**: Follow `rustfmt` and `clippy` recommendations
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
