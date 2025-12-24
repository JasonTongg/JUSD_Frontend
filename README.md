<img width="1448" height="900" alt="image" src="https://github.com/user-attachments/assets/b238148b-0861-4b74-ab32-06e7b2071583" />

# JUSD Stablecoin Frontend

## Project Overview

This repository contains the client-side application for the JUSD Stablecoin project. It serves as the user interface (UI) for interacting with the core JUSD smart contracts (Engine, Token, Staking, etc.) and is designed to provide a rich, responsive experience for users to manage their collateralized debt positions (CDPs).

- **Live Product:** [JUSD](https://jusd-stablecoin.vercel.app/).
- **Smart Contract using Foundry:** [JUSD Smart Contract](https://github.com/JasonTongg/JUSD)

The frontend is built with:

* **Framework:** [Next.js](https://nextjs.org/)
* **Language:** JavaScript (with a focus on modern web development)
* **Styling:** Likely uses a combination of modern CSS solutions (Tailwind CSS and Material UI) for a clean look.
* **Web3:** Integrates with wallet connectors and standard Web3 libraries to read data and send transactions to the JUSD smart contracts.

The application allows users to visually perform key stablecoin operations, including:

* Connecting a wallet (Rainbow Kit).
* Viewing current ETH/JUSD prices and system rates (Borrow Rate, Savings Rate).
* Depositing ETH collateral and viewing its USD value.
* Minting (borrowing) and Repaying JUSD.
* Viewing and managing individual debt positions.
* Interacting with the liquidation mechanism.

## Network & Demo Notes:
- The protocol is currently deployed and running on the Sepolia testnet.
- The live demo operates with limited liquidity, as it is intended for demonstration and educational purposes rather than production use.

## Author  

**Jason Tong**  

- **Product:** [JUSD](https://jusd-stablecoin.vercel.app/)
- **GitHub:** [JasonTongg](https://github.com/JasonTongg).
- **Linkedin:** [Jason Tong](https://www.linkedin.com/in/jason-tong-42600319a/).
