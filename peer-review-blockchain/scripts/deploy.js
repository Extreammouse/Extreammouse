// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the contract factory
  const PeerReviewSystem = await hre.ethers.getContractFactory("PeerReviewSystem");
  
  // Deploy the contract
  console.log("Deploying PeerReviewSystem...");
  const peerReviewSystem = await PeerReviewSystem.deploy();
  
  // Wait for deployment to finish
  await peerReviewSystem.deployed();
  
  console.log("PeerReviewSystem deployed to:", peerReviewSystem.address);
  
  // Save the contract address to a file
  const contractsDir = path.join(__dirname, "..", "src", "contracts");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ PeerReviewSystem: peerReviewSystem.address }, null, 2)
  );
  
  // Copy the contract artifacts to the frontend directory
  const artifactsDir = path.join(__dirname, "..", "src", "artifacts");
  
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  
  // Copy artifact
  fs.copyFileSync(
    path.join(__dirname, "..", "artifacts", "contracts", "PeerReviewSystem.sol", "PeerReviewSystem.json"),
    path.join(artifactsDir, "contracts", "PeerReviewSystem.sol", "PeerReviewSystem.json"),
    { recursive: true }
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });