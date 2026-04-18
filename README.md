🚀 MedSupplyChain

A Blockchain-Based Drug Tracking and Verification System

📌 Overview

MedSupplyChain is a decentralized application (DApp) designed to improve transparency, security, and traceability in pharmaceutical supply chains. It uses blockchain technology to track drug batches from manufacturer to end-user, preventing counterfeit drugs and ensuring authenticity.

🎯 Objectives
Ensure drug authenticity verification
Provide end-to-end traceability
Prevent counterfeit medicines
Enable secure and transparent transactions
Improve trust between stakeholders
🏗️ System Architecture

The system consists of three main modules:

🔹 Smart Contracts (medsupplychain-contracts)
Written in Solidity
Handles:
Batch registration
Ownership transfer
Verification logic

🔹 Frontend (medsupplychain-frontend)
Built using React + TypeScript
Features:
User interface for interactions
Wallet connection
Batch lookup & QR verification

🔹 Backend (server)
Node.js backend
Handles:
API requests
Transaction handling
Off-chain logic

⚙️ Technologies Used
Blockchain: Ethereum
Smart Contracts: Solidity, Hardhat
Frontend: React, TypeScript, Tailwind CSS
Backend: Node.js, Express
Web3 Integration: Ethers.js / Web3.js

🔄 Workflow
Manufacturer registers a drug batch
Batch is stored on blockchain
Ownership transfers across supply chain
QR code generated for verification
End user scans QR → verifies authenticity

🔐 Key Features
Tamper-proof records
Transparent tracking
Role-based access (Manufacturer, Distributor, etc.)
Real-time verification
Secure blockchain transactions

📁 Project Structure
MedSupplyChain/
│── medsupplychain-contracts/
│── medsupplychain-frontend/
│── server/
│── .gitignore
🚫 Ignored Files

The following are excluded using .gitignore:
node_modules
.env files
build/dist folders

▶️ How to Run
1. Clone the repository
git clone https://github.com/ArockiaAntoDeepak0003/MEDSUPPLYCHAIN.git
2. Install dependencies
cd medsupplychain-frontend
npm install
cd ../server
npm install
3. Run frontend
npm run dev
4. Run backend
node server.js

📊 Future Enhancements
Integration with IoT for real-time tracking
Mobile application support
AI-based anomaly detection
Government regulatory integration

👨‍💻 Contributors
ArockiaAntoDeepak0003

📜 License
This project is for academic purposes.
