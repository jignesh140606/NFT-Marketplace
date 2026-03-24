# My Dapp

A Web3 application - composed with [N]skills

## 📁 Project Structure

```
my-dapp/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/
│       ├── package.json
│       └── ...
├── contracts/                  # Rust/Stylus smart contracts
│   ├── mycontract/            # Original contract (no caching)
│   │   └── src/lib.rs
│   └── cached-contract/       # Contract with is_cacheable helper
│       └── src/lib.rs
├── docs/                       # Documentation
├── scripts/                     # Deploy scripts
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd my-dapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
      - `PRIVATE_KEY`: Private key for deployment and transactions
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect Cloud project ID for wallet connections

4. **Deploy contracts** (from repo root): `pnpm deploy:sepolia` or `pnpm deploy:mainnet`

5. **Scripts (Windows):** Run `pnpm fix-scripts` or `dos2unix scripts/*.sh` if you see line-ending errors.

## 🔗 Smart Contracts

The `contracts/` folder contains Rust/Stylus smart contract source code. See `docs/` for deployment and integration guides.

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm deploy:sepolia` | Deploy to Arbitrum Sepolia |
| `pnpm deploy:mainnet` | Deploy to Arbitrum One |
| `pnpm fix-scripts` | Fix CRLF line endings (Windows) |

## 🌐 Supported Networks

- Arbitrum Sepolia (Testnet)
- Arbitrum One (Mainnet)
- Superposition
- Superposition Testnet

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Web3:** wagmi + viem
- **Wallet Connection:** RainbowKit

## 📖 Documentation

See the `docs/` folder for:
- Contract interaction guide
- Deployment instructions
- API reference

## License

MIT

---

Generated with ❤️ by [[N]skills](https://www.nskills.xyz)
