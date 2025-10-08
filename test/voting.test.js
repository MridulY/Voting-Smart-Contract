import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("Voting contract", function () {
  let Voting;
  let voting;
  let owner, alice, bob, charlie;

  beforeEach(async () => {
    [owner, alice, bob, charlie] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(["Yes", "No"]);
    await voting.waitForDeployment();
  });

  it("starts in Registration phase", async () => {
    expect(await voting.phase()).to.equal(0);
  });

  it("allows registration and prevents double registration", async () => {
    await voting.connect(alice).register();
    expect(await voting.isRegistered(alice.address)).to.equal(true);
    await expect(voting.connect(alice).register()).to.be.revertedWith("Already registered");
  });

  it("prevents voting before voting phase", async () => {
    await voting.connect(alice).register();
    await expect(voting.connect(alice).vote(0)).to.be.revertedWith("Invalid phase");
  });

  it("allows owner to advance phase to Voting and then to Ended", async () => {
    await voting.advancePhase();
    expect(await voting.phase()).to.equal(1);
    await voting.advancePhase();
    expect(await voting.phase()).to.equal(2);
  });

  it("does voting flow correctly", async () => {
    await voting.connect(alice).register();
    await voting.connect(bob).register();

    await voting.advancePhase();

    await voting.connect(alice).vote(0);
    await voting.connect(bob).vote(1);

    expect(await voting.getVotesFor(0)).to.equal(1);
    expect(await voting.getVotesFor(1)).to.equal(1);

    await voting.advancePhase();
    const [winnerIndex, winnerVotes] = await voting.winningProposal();
    expect(winnerVotes).to.be.at.least(0);
  });

  it("prevents double voting", async () => {
    await voting.connect(alice).register();
    await voting.advancePhase();
    await voting.connect(alice).vote(0);
    await expect(voting.connect(alice).vote(0)).to.be.revertedWith("Already voted");
  });

  it("prevents unregistered voting", async () => {
    await voting.advancePhase();
    await expect(voting.connect(charlie).vote(0)).to.be.revertedWith("Not registered");
  });

  it("rejects invalid proposal index", async () => {
    await voting.connect(alice).register();
    await voting.advancePhase();
    await expect(voting.connect(alice).vote(99)).to.be.revertedWith("Invalid proposal");
  });

  it("owner-only addProposal enforced", async () => {
    await expect(voting.connect(alice).addProposal("X")).to.be.reverted;
    await voting.addProposal("Maybe");
    expect(await voting.getProposalsCount()).to.equal(3);
  });
});
