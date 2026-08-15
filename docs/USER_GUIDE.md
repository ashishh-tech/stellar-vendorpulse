# 📖 VendorPulse User Guide & Operator Manual

> **Step-by-step instructions for procurement managers, suppliers, auditors, and governance signers on Stellar Mainnet.**

---

## 1. Getting Started

### 1.1 Prerequisites
- A Web3 Stellar wallet such as **Freighter** ([freighter.app](https://www.freighter.app)) or a modern browser supporting **WebAuthn / Passkeys** (Apple Touch ID, Windows Hello, YubiKey).
- The web app is accessible at: [https://stellar-vendorpulse.netlify.app](https://stellar-vendorpulse.netlify.app)

### 1.2 Connecting Your Wallet
1. Open the VendorPulse web app.
2. Click **Connect Wallet** in the top right corner.
3. Select **Freighter Wallet** or choose **WebAuthn Passkey (Smart Wallet)**.
4. Confirm permissions to interact with the Stellar Mainnet.

---

## 2. Registering a New Vendor

1. Navigate to the **Dashboard** (`/dashboard`).
2. Click **+ Register Vendor**.
3. Enter the vendor's legal entity name, operational category (e.g., *Logistics & Shipping, Cloud Infrastructure, Raw Materials*), and contact email.
4. Click **Submit Registration**.
5. When prompted, you can choose:
   - **Standard Signing**: Sign directly with your connected wallet.
   - **Gasless Fee Bump**: Check *"Sponsor Transaction"* to execute without paying XLM gas fees.
6. The transaction will be confirmed on Stellar Mainnet in ~3-5 seconds.

---

## 3. Submitting Vendor Evaluations & Reviews

1. Find the target vendor in the **Vendor Directory**.
2. Click **Submit Evaluation**.
3. Rate the vendor across the 4 key performance axes:
   - **Delivery Timeliness (0-100)**: Lead time SLA compliance.
   - **Product Quality (0-100)**: Defect and return rates.
   - **Payment Terms Compliance (0-100)**: Invoice accuracy and terms.
   - **Communication Reliability (0-100)**: Incident responsiveness.
4. Add an optional audit comment.
5. Click **Record Evaluation On-Chain**. The smart contract calculates the updated moving average atomically.

---

## 4. Using Advanced Level 6 Features

Navigate to **Advanced (L6)** in the top navigation bar:

### 4.1 Stellar Fee Bump Sponsorship
- View active gasless quota and live savings in XLM.
- Test simulated zero-cost contract execution.

### 4.2 Multi-Signature Governance
- Review pending proposals (`MSP-001`, `MSP-002`).
- Switch signer role (*Security Council*, *Lead Auditor*, *Procurement Lead*).
- Click **Sign Proposal** or **Execute On-Chain** once threshold (2/3) is achieved.

### 4.3 Cross-Border SEP-24 / SEP-31 Anchor Payouts
- Select source asset (`USDC`, `EURC`, `XLM`) and destination fiat currency (`EUR`, `BRL`, `NGN`, `INR`).
- Request locked anchor quotes with instant 0.4% network fees.
- Click **Confirm & Settle Payout** for sub-90-second international settlement.

### 4.4 Smart Wallet Account Abstraction
- Enroll a biometric Passkey device.
- Configure daily spend limits and session policies.
- Execute pre-approved micro-transactions without seed phrase friction.
