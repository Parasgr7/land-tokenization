# 🌍 TerraSwap DApp

A decentralized application (DApp) for claiming, releasing, and swapping virtual land squares using smart contracts. Users can manage their land inventory, and forcefully take over surrounded lands. Built with Solidity, Truffle, and React.

## 🚀 Features

- 📍 **Claim Land**: Users can claim land squares based on geolocation (must be at the location to claim).
- 🔓 **Release Land**: Frees up the square and removes it from the user’s inventory.
- 🔁 **Swap Land**: Swap owned land with another user's land.
- 🭵 **Delete User**: Users can delete themselves and release all their lands.
- 🏴‍☠️ **Force Takeover** (Bonus): If a user completely surrounds another user's land, they can take it over.
- 🗺️ **Visual Map Interface** (Bonus): Visual representation of owned land via map UI.

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity
- **Framework**: Truffle
- **Frontend**: React + Tailwind CSS
- **Blockchain Network**: Sepolia Testnet
- **Wallet Integration**: MetaMask
- **What3Words API**: Used for geolocation land square mapping (used alternative of Paid API)

---

## 📂 Project Structure

```
contracts/
  └── LandManagement.sol
client/
  └── React frontend
migrations/
  └── Migration scripts
truffle-config.js
```

---

## 🧠 Smart Contract Summary

### LandManagement.sol

- `claimLand(landId, lat, long)`
- `releaseLand(landId)`
- `swapLand(landId1, landId2, user2)`
- `deleteUser()`
- `getUserInventory()`
- `getLandDetails(landId)`
- `getAllLands()`

Includes modifiers for validation:
- `onlyOwner`, `landNotClaimed`, `landClaimed`, `userHasLand`, `validLandId`

---

## ⚠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Parasgr7/land-tokenization.git
cd land-tokenization
```

### 2. Install Dependencies

#### Truffle & Ganache CLI (if not installed)

```bash
npm install -g truffle
npm install
```

### 3. Compile Contracts

```bash
truffle compile
```

### 4. Migrate Contracts to Local Network

```bash
truffle migrate --network development
```

OR

### 5. Deploy to Sepolia Testnet

- Create a `.env` file:

```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_ID
```

- Install dependencies:

```bash
npm install @truffle/hdwallet-provider dotenv
```

- Update `truffle-config.js` with HDWalletProvider.

- Run:

```bash
truffle migrate --network sepolia --reset
```

---

## ⚠️ Security Note

If `.env` was accidentally pushed:

```bash
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Removed .env from repo"
git push origin main
```

For sensitive secrets removal from history, consider using [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/).

---

## 🔗 Resources

- [What3Words API](https://what3words.com/products#map-api)
- [Truffle Suite](https://trufflesuite.com/)
- [Sepolia Faucet](https://sepoliafaucet.com/)

---

## 🧑‍💻 Author

**Parasgr7**  
[GitHub](https://github.com/Parasgr7)

---

## 📄 License

MIT

