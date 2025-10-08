import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const initial = ["BJP", "INC", "AAP"];
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(initial);

  await voting.waitForDeployment();

  const votingAddress = await voting.getAddress();
  console.log("Voting deployed to:", votingAddress);

  console.log(
    "NEXT: verify with: npx hardhat verify --network sepolia " +
      votingAddress +
      " " +
      JSON.stringify(initial)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });