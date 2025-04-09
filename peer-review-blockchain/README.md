# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet (Goerli)
npx hardhat run scripts/deploy.js --network goerli

# Start the development server
npm run start

# For hardhat local network
npx hardhat node