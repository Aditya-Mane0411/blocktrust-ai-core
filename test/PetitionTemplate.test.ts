import { expect } from "chai";
import { ethers } from "hardhat";
import { PetitionTemplate } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PetitionTemplate", function () {
  let petitionTemplate: PetitionTemplate;
  let admin: SignerWithAddress;
  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;

  beforeEach(async function () {
    [admin, signer1, signer2] = await ethers.getSigners();

    const PetitionTemplate = await ethers.getContractFactory("PetitionTemplate");
    petitionTemplate = await PetitionTemplate.deploy();
    await petitionTemplate.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await petitionTemplate.admin()).to.equal(admin.address);
    });

    it("Should authorize admin as signer", async function () {
      expect(await petitionTemplate.authorizedSigners(admin.address)).to.be.true;
    });
  });

  describe("Petition Creation", function () {
    it("Should create a petition", async function () {
      const title = "Test Petition";
      const description = "Save the environment";
      const targetSignatures = 1000;
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400 * 30; // 30 days
      const ipfsHash = "QmPetition123";

      await expect(
        petitionTemplate.createPetition(
          title,
          description,
          targetSignatures,
          startTime,
          endTime,
          ipfsHash
        )
      )
        .to.emit(petitionTemplate, "PetitionCreated")
        .withArgs(0, title, admin.address, targetSignatures);

      const details = await petitionTemplate.getPetitionDetails(0);
      expect(details.title).to.equal(title);
      expect(details.targetSignatures).to.equal(targetSignatures);
      expect(details.isActive).to.be.true;
    });

    it("Should fail with invalid time range", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime - 1000;

      await expect(
        petitionTemplate.createPetition(
          "Test",
          "Description",
          100,
          startTime,
          endTime,
          "ipfs"
        )
      ).to.be.revertedWith("Invalid time range");
    });

    it("Should fail with zero target", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;

      await expect(
        petitionTemplate.createPetition(
          "Test",
          "Description",
          0,
          startTime,
          endTime,
          "ipfs"
        )
      ).to.be.revertedWith("Target must be greater than 0");
    });
  });

  describe("Signer Authorization", function () {
    it("Should authorize a signer", async function () {
      await expect(petitionTemplate.authorizeSigner(signer1.address))
        .to.emit(petitionTemplate, "SignerAuthorized")
        .withArgs(signer1.address);

      expect(await petitionTemplate.authorizedSigners(signer1.address)).to.be.true;
    });

    it("Should batch authorize signers", async function () {
      const signers = [signer1.address, signer2.address];
      await petitionTemplate.authorizeSigners(signers);

      expect(await petitionTemplate.authorizedSigners(signer1.address)).to.be.true;
      expect(await petitionTemplate.authorizedSigners(signer2.address)).to.be.true;
    });
  });

  describe("Signing Petition", function () {
    let petitionId: number;
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 86400 * 30;

    beforeEach(async function () {
      await petitionTemplate.createPetition(
        "Test Petition",
        "Description",
        100,
        startTime,
        endTime,
        "ipfs"
      );
      petitionId = 0;
      await petitionTemplate.authorizeSigner(signer1.address);
    });

    it("Should allow authorized signer to sign", async function () {
      const comment = "I support this cause!";
      
      await expect(
        petitionTemplate.connect(signer1).signPetition(petitionId, comment)
      )
        .to.emit(petitionTemplate, "PetitionSigned")
        .withArgs(petitionId, signer1.address, comment);

      const hasSigned = await petitionTemplate.hasSigned(petitionId, signer1.address);
      expect(hasSigned).to.be.true;

      const storedComment = await petitionTemplate.getSignerComment(petitionId, signer1.address);
      expect(storedComment).to.equal(comment);
    });

    it("Should prevent duplicate signatures", async function () {
      await petitionTemplate.connect(signer1).signPetition(petitionId, "First");

      await expect(
        petitionTemplate.connect(signer1).signPetition(petitionId, "Second")
      ).to.be.revertedWith("Already signed");
    });

    it("Should track signature count", async function () {
      await petitionTemplate.connect(signer1).signPetition(petitionId, "Support");
      
      const details = await petitionTemplate.getPetitionDetails(petitionId);
      expect(details.currentSignatures).to.equal(1);
    });

    it("Should check if target is reached", async function () {
      await petitionTemplate.createPetition(
        "Small Petition",
        "Description",
        2,
        startTime,
        endTime,
        "ipfs"
      );
      
      await petitionTemplate.authorizeSigner(signer2.address);
      await petitionTemplate.connect(signer1).signPetition(1, "Support");
      await petitionTemplate.connect(signer2).signPetition(1, "Support");

      const reached = await petitionTemplate.hasReachedTarget(1);
      expect(reached).to.be.true;
    });
  });

  describe("Petition Finalization", function () {
    it("Should allow creator to finalize", async function () {
      const startTime = Math.floor(Date.now() / 1000) - 2000;
      const endTime = startTime + 1000;

      await petitionTemplate.createPetition(
        "Past Petition",
        "Description",
        100,
        startTime,
        endTime,
        "ipfs"
      );

      const resultsHash = "QmResults456";
      await expect(
        petitionTemplate.finalizePetition(0, resultsHash)
      )
        .to.emit(petitionTemplate, "PetitionFinalized");

      const details = await petitionTemplate.getPetitionDetails(0);
      expect(details.isActive).to.be.false;
    });

    it("Should fail to finalize before end time", async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;

      await petitionTemplate.createPetition(
        "Active Petition",
        "Description",
        100,
        startTime,
        endTime,
        "ipfs"
      );

      await expect(
        petitionTemplate.finalizePetition(0, "results")
      ).to.be.revertedWith("Petition has not ended");
    });
  });
});
