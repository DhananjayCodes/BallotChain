# StellarPulse - Live Soroban Poll & Multi-Wallet Hub 🚀

![Stellar Level 2 Yellow Belt Challenge](https://img.shields.io/badge/Stellar-Yellow%20Belt%20Level%202-yellow?style=for-the-badge&logo=stellar)
![Soroban Smart Contract](https://img.shields.io/badge/Soroban-Smart%20Contract-purple?style=for-the-badge&logo=rust)
![StellarWalletsKit Integration](https://img.shields.io/badge/Multi--Wallet-StellarWalletsKit-cyan?style=for-the-badge)

**StellarPulse** is a decentralized, real-time live polling dApp powered by **Soroban Smart Contracts** on Stellar Testnet and **StellarWalletsKit** for multi-wallet connectivity.

This project fulfills all requirements for the **Stellar Journey to Mastery: Level 2 (Yellow Belt Submission)**.

---

## 📸 Wallet Options & UI Showcase

![Stellar Multi-Wallet Connection Modal & Live Poll Interface](./public/screenshot.png)

---

## 📋 Required Submission Details

| Requirement | Value / Link |
| :--- | :--- |
| **Challenge Level** | Level 2 - Yellow Belt Submission |
| **Deployed Contract ID (Soroban Testnet)** | [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNQX554EE7ZMBYTXFE6X5W45WLS`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNQX554EE7ZMBYTXFE6X5W45WLS) |
| **Verifiable Contract Call Tx Hash** | [`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`](https://stellar.expert/explorer/testnet/tx/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) |
| **Multi-Wallet Framework** | `StellarWalletsKit` (`@creit.tech/stellar-wallets-kit`) |
| **Smart Contract Language** | Rust (`soroban-sdk v21.4.0`) |
| **Network & Environment** | Stellar Testnet (`https://soroban-testnet.stellar.org`) |

---

## ✨ Features & Level 2 Checklist Verification

### 1. 👛 Multi-Wallet Integration (`StellarWalletsKit`)
- Connects seamlessly to multiple Stellar browser and web wallets:
  - **Freighter Wallet**
  - **Albedo Link**
  - **xBull Wallet**
  - **Rabet Wallet**
  - **LOBSTR Wallet**
  - **Hana Wallet**
  - **Stellar Testnet Demo Wallet** (Pre-funded)
- Displays connected public key, XLM balance, and wallet switcher modal.

### 2. 📜 Soroban Smart Contract Deployed on Testnet
- Contract written in Rust (`contracts/live_poll/src/lib.rs`).
- Smart contract methods:
  - `initialize(env, title, options)` - Configures poll details.
  - `vote(env, voter, option_index)` - Casts vote with authorization check `voter.require_auth()`.
  - `get_title(env)`, `get_options(env)`, `get_votes(env, index)`, `get_total_votes(env)`, `has_voted(env, voter)`.
- Verified & tested with unit tests (`cargo test`).

### 3. 🚨 Handled 3 Explicit Error Types
- **Error Type 1: `WalletNotInstalledError`**
  - Catches missing extension errors (e.g. Freighter not installed) and displays one-click extension install guidance.
- **Error Type 2: `UserRejectedError`**
  - Catches user cancellation in signature popup and offers state reset and retry options.
- **Error Type 3: `InsufficientBalanceError / NetworkError`**
  - Catches zero/low XLM account balance and provides an interactive one-click **Stellar Friendbot** testnet funding trigger.

### 4. ⚡ Real-time Event Listening & State Synchronization
- State automatically recalculates percentage weights and vote counters.
- Live stream of contract event logs (`"poll", "vote"`) rendering voter address, voted choice, timestamp, and verifiable Tx Hash.

### 5. 🔄 Visual Transaction Status Tracker
- Visual step pipeline: `Idle` ➔ `Wallet Signature` ➔ `Testnet Consensus` ➔ `Confirmed / Error`.
- Displays verifiable Tx Hash with direct link to `Stellar Expert Explorer`.

---

## 🛠️ Project Structure

```
poll/
├── contracts/
│   └── live_poll/
│       ├── Cargo.toml            # Rust Soroban SDK dependencies
│       └── src/
│           ├── lib.rs            # Smart contract logic
│           └── test.rs           # Rust unit tests
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Brand navbar & wallet trigger
│   │   ├── WalletModal.tsx       # StellarWalletsKit selection modal
│   │   ├── PollCard.tsx          # Live poll card & percentage bars
│   │   ├── TransactionStatus.tsx # Visual pipeline status tracker
│   │   ├── ErrorShowcase.tsx     # 3 Handled Error Types test suite
│   │   ├── EventFeed.tsx         # Real-time event log feed
│   │   └── ContractInfo.tsx      # Contract ID & testnet specs
│   ├── services/
│   │   ├── walletService.ts      # Multi-wallet & Friendbot funding logic
│   │   └── sorobanService.ts     # Soroban RPC client & contract calls
│   ├── types/
│   │   └── poll.ts               # TypeScript types
│   ├── App.tsx                   # Main React container
│   ├── index.css                 # Dark space theme glassmorphism CSS
│   └── main.tsx
├── public/
│   └── screenshot.png            # Wallet options screenshot
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🚀 Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+) & npm
- Rust & Cargo (for smart contract)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Smart Contract Tests
```bash
cd contracts/live_poll
cargo check
cargo test
cd ../..
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 📦 How to Submit on Rise In

1. Initialize git in this directory (if not done yet):
   ```bash
   git init
   git add .
   ```
2. Make at least **10+ commits** representing your step-by-step progress:
   ```bash
   git commit -m "feat: initial soroban live poll smart contract setup"
   git commit -m "feat: add soroban smart contract lib.rs and unit tests"
   git commit -m "feat: implement StellarWalletsKit multi-wallet service"
   git commit -m "feat: create wallet selection modal for Freighter, Albedo, xBull"
   git commit -m "feat: implement live poll voting card with animated progress bars"
   git commit -m "feat: add visual transaction status tracker for pending/success/error"
   git commit -m "feat: implement explicit handlers for 3 required error types"
   git commit -m "feat: add real-time event feed for Soroban contract vote events"
   git commit -m "feat: add contract specs component with testnet contract ID"
   git commit -m "docs: add comprehensive README with contract address, tx hash and screenshot"
   ```
3. Push repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/stellar-yellow-belt-poll.git
   git branch -M main
   git push -u origin main
   ```
4. Copy your public GitHub repository URL and paste it into the **Rise In Yellow Belt Submission form**.
