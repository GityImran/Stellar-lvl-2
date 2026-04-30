# Stellar LiveHub

## Real-Time Decentralized Engagement Platform Built on Stellar Soroban

**Stellar LiveHub** is a real-time decentralized application (dApp) built on the Stellar network using Soroban smart contracts and Next.js.

The platform combines live auctions, realtime voting, payment activity tracking, gamified leaderboards, and blockchain event synchronization into a single interactive experience powered entirely by on-chain data.

Unlike traditional web applications, Stellar LiveHub continuously synchronizes state across connected clients using live smart contract event tracking. When one user interacts with the blockchain, every connected client automatically updates without requiring a manual refresh.

---

# ✨ Core Features

## 🔥 Real-Time Auction System

Users can participate in a live on-chain bidding system.

* place bids directly through the smart contract
* highest bid updates globally in realtime
* bid validation enforced on-chain
* optimistic UI updates for smoother UX

---

## 🗳 Live Polling System

Users can participate in a decentralized YES/NO poll.

* realtime vote synchronization
* instant vote count updates
* blockchain-backed voting state

---

## 💸 Payment Tracking

Users can record payment activity directly on-chain.

* track payment events
* realtime payment feed updates
* activity synchronization across all connected users

---

## 🏆 Gamified Leaderboard

Every interaction earns score points.

### Score System

| Action        | Points |
| ------------- | ------ |
| Place Bid     | +5     |
| Vote          | +2     |
| Track Payment | +3     |

Leaderboard rankings automatically update in realtime.

---

## 📡 Real-Time Blockchain Event Synchronization

The application continuously listens for Soroban smart contract events and synchronizes updates globally.

When any user:

* places a bid
* votes
* tracks a payment

all connected dashboards automatically update without requiring a refresh.

---

## 📢 Live Activity Feed

A realtime blockchain activity stream displays recent contract interactions.

Examples:

* user placed a new bid
* user voted YES
* user tracked payment

The feed updates dynamically using live blockchain event polling.

---

## 🔐 Multi-Wallet Support

Integrated using Stellar Wallets Kit.

Supported wallet flows include:

* wallet connection
* wallet disconnection
* transaction signing
* network validation

---

## ⚡ Transaction Lifecycle Tracking

Every blockchain transaction provides visible UI feedback.

Supported states:

* pending
* success
* failed

Successful transactions include direct explorer verification links.

---

# 🏗 System Architecture

## Frontend Architecture

Built using:

* Next.js App Router
* TypeScript
* TailwindCSS

The frontend is structured around modular realtime components and shared synchronization state.

---

## Smart Contract Architecture

The Soroban smart contract manages:

* auction state
* poll state
* payment activity
* user scoring
* contract event emission

Persistent contract storage tracks:

* highest bid
* highest bidder
* poll counts
* user activity stats

---

## Real-Time Event System

Since Soroban currently does not provide native websocket event streaming, the application implements a custom realtime synchronization layer.

### Event Synchronization Flow

```txt
Smart Contract Event
        ↓
Soroban RPC Polling
        ↓
XDR Event Decoding
        ↓
Realtime State Store
        ↓
Automatic UI Updates
```

---

## Optimistic UI Updates

The frontend uses optimistic updates to improve perceived responsiveness.

UI state updates immediately while waiting for blockchain confirmation.

---

# 🛠 Tech Stack

| Category              | Technology                                 |
| --------------------- | ------------------------------------------ |
| Blockchain            | Stellar Soroban                            |
| Smart Contracts       | Rust                                       |
| Frontend Framework    | Next.js 15+                                |
| Language              | TypeScript                                 |
| Wallet Integration    | Stellar Wallets Kit                        |
| Styling               | TailwindCSS                                |
| Icons                 | Lucide React                               |
| Smart Contract Client | Auto-generated Soroban TypeScript Bindings |

---

# 📂 Project Structure

```txt
src/
 ├── app/
 ├── components/
 │     ├── activity/
 │     ├── dashboard/
 │     ├── leaderboard/
 │     ├── transactions/
 │     └── wallet/
 ├── context/
 ├── hooks/
 ├── lib/
 ├── services/
 ├── store/
 └── types/

contract/
 └── livehub-contract/
```

---

# 💻 Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/GityImran/Stellar-lvl-2
cd Stellar-lvl-2
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```txt
.env.local
```

Add:

```env
NEXT_PUBLIC_CONTRACT_ID=CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR

NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

---

## 4. Start Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# 📄 Smart Contract Information

## Network

Stellar Testnet

---

## Contract ID

```txt
CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR
```

---

## Contract Explorer

View deployed contract on:

[Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR)

---

# 🔍 Smart Contract Functions

| Function             | Purpose                      |
| -------------------- | ---------------------------- |
| `place_bid()`        | submit live auction bids     |
| `vote()`             | submit YES/NO vote           |
| `track_payment()`    | record payment activity      |
| `get_highest_bid()`  | fetch highest auction bid    |
| `get_poll_results()` | fetch poll state             |
| `get_user_score()`   | fetch user leaderboard stats |

---

# 📡 Smart Contract Events

The contract emits realtime events for frontend synchronization.

| Event      | Purpose                         |
| ---------- | ------------------------------- |
| `NEW_BID`  | emitted when bid is placed      |
| `NEW_VOTE` | emitted when vote occurs        |
| `PAYMENT`  | emitted when payment is tracked |

---

# 📸 Screenshots

### Wallet Options Available

![Wallet Options](/public/screenshots/wallet-options.png)

### Connected Wallet State

![Connected Wallet](/public/screenshots/connected-wallet.png)

### Transaction Success & Notification

![Transaction Success](/public/screenshots/transaction-success.png)

### Live Dashboard

![Live Dashboard](/public/screenshots/live-dashboard.png)

### Realtime Leaderboard

![Leaderboard](/public/screenshots/leaderboard.png)

### Activity Feed

![Activity Feed](/public/screenshots/activity-feed.png)

---

# 🔗 Transaction Verification

All transactions executed through the application are verifiable on the Stellar Testnet.

## Explorer Verification

Verify transactions using:

[Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)

---

# 🌐 Live Demo

## Production Deployment

https://stellar-lvl-2.vercel.app/

---

# ⚠ Error Handling

The application handles multiple wallet and transaction failure scenarios.

Supported error handling includes:

* wallet not installed
* rejected wallet signatures
* insufficient balance
* failed contract execution
* RPC synchronization failures

---

# 🚀 Performance Optimizations

Implemented optimizations include:

* realtime state synchronization
* optimized polling intervals
* duplicate event prevention
* optimistic UI rendering
* cleanup of event listeners
* minimized unnecessary rerenders

---

# ✅ Level 2 Requirement Coverage

| Requirement                   | Status |
| ----------------------------- | ------ |
| Multi-wallet integration      | ✅      |
| Smart contract deployed       | ✅      |
| Frontend contract interaction | ✅      |
| Read/write contract state     | ✅      |
| Realtime synchronization      | ✅      |
| Event handling                | ✅      |
| Transaction tracking          | ✅      |
| Error handling                | ✅      |

---

# ✅ Final Submission Checklist

* [x] multi-wallet integration
* [x] deployed smart contract
* [x] realtime event synchronization
* [x] transaction lifecycle tracking
* [x] live leaderboard updates
* [x] realtime activity feed
* [x] wallet error handling
* [x] smart contract frontend integration

---

# 📜 License

This project is built for educational and experimental purposes on Stellar Testnet.
