import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingTemplate } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VotingTemplate", function () {
  let votingTemplate: VotingTemplate;
  let admin: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;

  beforeEach(async function () {
    [admin, voter1, voter2] = await ethers.getSigners();

    const VotingTemplate = await ethers.getContractFactory("VotingTemplate");
    votingTemplate = await VotingTemplate.deploy();
    await votingTemplate.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await votingTemplate.admin()).to.equal(admin.address);
    });

    it("Should authorize admin as voter", async function () {
      expect(await votingTemplate.authorizedVoters(admin.address)).to.be.true;
    });
  });

  describe("Event Creation", function () {
    it("Should create a voting event", async function () {
      const title = "Test Voting Event";
      const description = "Test Description";
      const options = ["Option 1", "Option 2", "Option 3"];
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400; // 1 day later
      const ipfsHash = "QmTest123";

      await expect(
        votingTemplate.createVotingEvent(
          title,
          description,
          options,
          startTime,
          endTime,
          ipfsHash
        )
      )
        .to.emit(votingTemplate, "VotingEventCreated")
        .withArgs(0, title, startTime, endTime);

      const eventDetails = await votingTemplate.getEventDetails(0);
      expect(eventDetails.title).to.equal(title);
      expect(eventDetails.options).to.deep.equal(options);
      expect(eventDetails.isActive).to.be.true;
    });

    it("Should fail if end time is before start time", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime - 1000;

      await expect(
        votingTemplate.createVotingEvent(
          "Test",
          "Description",
          ["A", "B"],
          startTime,
          endTime,
          "ipfs"
        )
      ).to.be.revertedWith("Invalid time range");
    });

    it("Should fail with less than 2 options", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;

      await expect(
        votingTemplate.createVotingEvent(
          "Test",
          "Description",
          ["Only One"],
          startTime,
          endTime,
          "ipfs"
        )
      ).to.be.revertedWith("Need at least 2 options");
    });
  });

  describe("Voter Authorization", function () {
    it("Should authorize a voter", async function () {
      await expect(votingTemplate.authorizeVoter(voter1.address))
        .to.emit(votingTemplate, "VoterAuthorized")
        .withArgs(voter1.address);

      expect(await votingTemplate.authorizedVoters(voter1.address)).to.be.true;
    });

    it("Should batch authorize voters", async function () {
      const voters = [voter1.address, voter2.address];
      await votingTemplate.authorizeVoters(voters);

      expect(await votingTemplate.authorizedVoters(voter1.address)).to.be.true;
      expect(await votingTemplate.authorizedVoters(voter2.address)).to.be.true;
    });

    it("Should fail if non-admin tries to authorize", async function () {
      await expect(
        votingTemplate.connect(voter1).authorizeVoter(voter2.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Voting", function () {
    let eventId: number;
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 86400;

    beforeEach(async function () {
      await votingTemplate.createVotingEvent(
        "Test Event",
        "Description",
        ["Option A", "Option B"],
        startTime,
        endTime,
        "ipfs"
      );
      eventId = 0;
      await votingTemplate.authorizeVoter(voter1.address);
    });

    it("Should allow authorized voter to cast vote", async function () {
      await expect(votingTemplate.connect(voter1).castVote(eventId, 0))
        .to.emit(votingTemplate, "VoteCast")
        .withArgs(eventId, voter1.address, 0);

      const hasVoted = await votingTemplate.hasVoted(eventId, voter1.address);
      expect(hasVoted).to.be.true;

      const results = await votingTemplate.getResults(eventId);
      expect(results[0]).to.equal(1);
    });

    it("Should prevent duplicate voting", async function () {
      await votingTemplate.connect(voter1).castVote(eventId, 0);

      await expect(
        votingTemplate.connect(voter1).castVote(eventId, 1)
      ).to.be.revertedWith("Already voted");
    });

    it("Should fail if voter is not authorized", async function () {
      await expect(
        votingTemplate.connect(voter2).castVote(eventId, 0)
      ).to.be.revertedWith("Not an authorized voter");
    });

    it("Should fail with invalid option index", async function () {
      await expect(
        votingTemplate.connect(voter1).castVote(eventId, 5)
      ).to.be.revertedWith("Invalid option");
    });
  });

  describe("Event Finalization", function () {
    it("Should finalize event after end time", async function () {
      const startTime = Math.floor(Date.now() / 1000) - 2000;
      const endTime = startTime + 1000;

      await votingTemplate.createVotingEvent(
        "Past Event",
        "Description",
        ["A", "B"],
        startTime,
        endTime,
        "ipfs"
      );

      const resultsHash = "QmResults123";
      await expect(votingTemplate.finalizeEvent(0, resultsHash))
        .to.emit(votingTemplate, "EventFinalized")
        .withArgs(0, resultsHash);

      const eventDetails = await votingTemplate.getEventDetails(0);
      expect(eventDetails.isActive).to.be.false;
    });

    it("Should fail to finalize before end time", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;

      await votingTemplate.createVotingEvent(
        "Active Event",
        "Description",
        ["A", "B"],
        startTime,
        endTime,
        "ipfs"
      );

      await expect(
        votingTemplate.finalizeEvent(0, "results")
      ).to.be.revertedWith("Event has not ended");
    });
  });
});
