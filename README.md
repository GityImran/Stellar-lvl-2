# Stellar LiveHub

**Stellar LiveHub** is a decentralized real-time platform built on Stellar Soroban. 
It provides an interactive, live dashboard for participating in on-chain auctions, voting in polls, and tracking payments—all synchronized in real time with the Stellar testnet without requiring manual page refreshes.

## 🚀 Core Features

- **Live Auction Bidding:** Place bids and instantly see the highest bidder update across all connected clients.
- **Live Polls:** Cast your vote and watch the real-time aggregate of YES/NO votes.
- **Payment Tracking:** Record payments on-chain.
- **Real-time Activity Feed:** A live feed displaying all recent contract interactions with a CSS-animated slide-in effect.
- **Dynamic Leaderboard:** Users are automatically scored based on their activity (Bids = 3 pts, Payments = 2 pts, Votes = 1 pt).
- **Global Toast Notifications:** Real-time feedback for all interactions, including direct links to Stellar Expert for transaction verification.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Smart Contract:** [Stellar Soroban](https://soroban.stellar.org/)
- **Wallet Integration:** [Stellar Wallets Kit](https://github.com/creit-tech/stellar-wallets-kit)
- **Styling:** [TailwindCSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 💻 Local Setup

Follow these steps to run the project locally.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Ensure you have a `.env.local` file (optional if relying on defaults):
   ```env
   NEXT_PUBLIC_CONTRACT_ID=CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR
   NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📄 Contract Information

The smart contract is deployed on the **Stellar Testnet**.

- **Contract ID:**
  ```txt
  CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR
  ```
- **Network:** Testnet
- **Explorer:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR)

---

## 📸 Screenshots

### Wallet Options Available
![Wallet Options](https://via.placeholder.com/800x400?text=Wallet+Options+Available)

### Connected Wallet State
![Connected Wallet](https://via.placeholder.com/800x400?text=Connected+Wallet+State)

### Transaction Success & Notification
![Transaction Success](https://via.placeholder.com/800x400?text=Transaction+Success+Toast+Notification)

### Live Dashboard
![Live Dashboard](https://via.placeholder.com/800x400?text=Live+Dashboard+Overview)

### Realtime Leaderboard
![Leaderboard](https://via.placeholder.com/800x400?text=Realtime+Leaderboard)

### Activity Feed
![Activity Feed](https://via.placeholder.com/800x400?text=Realtime+Activity+Feed)

---

## 🔍 Transaction Verification

All transactions executed via the UI can be verified directly on the Stellar testnet.

- **Sample Transaction Hash:**
  `0x... (Your transaction hash here)`
- **Verification Link:**
  [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)

---

## 🌐 Live Demo

- **Deployed Frontend URL:** [Deploy to Vercel and paste link here]

---

## ✅ Final Submission Checklist

- [x] multi-wallet integration
- [x] deployed smart contract
- [x] realtime events
- [x] transaction tracking
- [x] leaderboard updates
- [x] activity feed
- [x] wallet error handling
- [x] contract interaction from frontend
