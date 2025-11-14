import { ethers } from "hardhat";

/**
 * Script to cast a vote on a deployed VotingTemplate contract
 * Usage: npx hardhat run scripts/vote.ts --network <network>
 */
async function main() {
  const args = process.argv.slice(2);
  const eventId = args.find(arg => arg.startsWith('--event-id'))?.split('=')[1];
  const optionIndex = args.find(arg => arg.startsWith('--option-index'))?.split('=')[1];
  const voterIndex = parseInt(args.find(arg => arg.startsWith('--voter-index'))?.split('=')[1] || '0');

  if (!eventId || optionIndex === undefined) {
    console.error("Usage: npx hardhat run scripts/vote.ts -- --event-id=<id> --option-index=<index> [--voter-index=<index>]");
    process.exit(1);
  }

  console.log("🗳️  Casting vote...");

  const signers = await ethers.getSigners();
  const voter = signers[voterIndex];
  console.log("Voter:", voter.address);
  console.log("Event ID:", eventId);
  console.log("Option Index:", optionIndex);

  // Get the deployed VotingTemplate address from latest deployment
  // In production, this should read from deployments directory
  const votingAddress = process.env.VOTING_CONTRACT_ADDRESS;
  if (!votingAddress) {
    throw new Error("VOTING_CONTRACT_ADDRESS not set in environment");
  }

  const VotingTemplate = await ethers.getContractFactory("VotingTemplate");
  const votingContract = VotingTemplate.attach(votingAddress);

  // Cast vote
  const tx = await votingContract.connect(voter).castVote(eventId, optionIndex);
  await tx.wait();

  console.log("✅ Vote cast successfully!");
  console.log("Transaction hash:", tx.hash);
  console.log("Block number:", tx.blockNumber);

  // Get updated results
  const results = await votingContract.getResults(eventId);
  console.log("\n📊 Current results:", results.map((v: any) => v.toString()));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
