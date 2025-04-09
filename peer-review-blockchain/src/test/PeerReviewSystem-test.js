// test/PeerReviewSystem-test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256, toUtf8Bytes } = ethers.utils;

describe("PeerReviewSystem", function () {
  let PeerReviewSystem;
  let peerReviewSystem;
  let owner;
  let reviewer1;
  let reviewer2;
  let author;
  let addr4;
  
  // Constants
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const REVIEWER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REVIEWER_ROLE"));
  
  beforeEach(async function () {
    // Get signers
    [owner, reviewer1, reviewer2, author, addr4] = await ethers.getSigners();
    
    // Deploy the contract
    PeerReviewSystem = await ethers.getContractFactory("PeerReviewSystem");
    peerReviewSystem = await PeerReviewSystem.deploy();
    await peerReviewSystem.deployed();
    
    // Add reviewers
    await peerReviewSystem.addReviewer(reviewer1.address);
    await peerReviewSystem.addReviewer(reviewer2.address);
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await peerReviewSystem.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    });
    
    it("Should assign reviewer roles correctly", async function () {
      expect(await peerReviewSystem.hasRole(REVIEWER_ROLE, reviewer1.address)).to.equal(true);
      expect(await peerReviewSystem.hasRole(REVIEWER_ROLE, reviewer2.address)).to.equal(true);
      expect(await peerReviewSystem.hasRole(REVIEWER_ROLE, author.address)).to.equal(false);
    });
  });
  
  describe("Paper Submission", function () {
    it("Should allow paper submission", async function () {
      const ipfsHash = "QmT1234567890abcdefghijklmnopqrstuvwxyz";
      const metadataHash = "QmZ1234567890abcdefghijklmnopqrstuvwxyz";
      const minReviewsRequired = 2;
      
      await expect(
        peerReviewSystem.connect(author).submitPaper(ipfsHash, metadataHash, minReviewsRequired)
      )
        .to.emit(peerReviewSystem, "PaperSubmitted")
        .withArgs(1, author.address, ipfsHash);
      
      const paper = await peerReviewSystem.papers(1);
      expect(paper.author).to.equal(author.address);
      expect(paper.ipfsHash).to.equal(ipfsHash);
      expect(paper.metadataHash).to.equal(metadataHash);
      expect(paper.status).to.equal(0); // Submitted
      expect(paper.minReviewsRequired).to.equal(minReviewsRequired);
      expect(paper.isPublic).to.equal(false);
    });
    
    it("Should reject submission with empty IPFS hash", async function () {
      await expect(
        peerReviewSystem.connect(author).submitPaper("", "metadata", 2)
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
    
    it("Should reject submission with less than 2 required reviews", async function () {
      await expect(
        peerReviewSystem.connect(author).submitPaper("ipfs", "metadata", 1)
      ).to.be.revertedWith("At least 2 reviews required");
    });
  });
  
  describe("Reviewer Assignment", function () {
    beforeEach(async function () {
      // Submit a paper
      await peerReviewSystem.connect(author).submitPaper("ipfsHash", "metadataHash", 2);
    });
    
    it("Should allow admin to assign reviewers", async function () {
      await expect(
        peerReviewSystem.assignReviewer(1, reviewer1.address)
      )
        .to.emit(peerReviewSystem, "ReviewerAssigned")
        .withArgs(1, reviewer1.address);
      
      const paper = await peerReviewSystem.papers(1);
      expect(paper.status).to.equal(1); // UnderReview
      
      const assignedPapers = await peerReviewSystem.getPapersAssignedToReviewer(reviewer1.address);
      expect(assignedPapers.length).to.equal(1);
      expect(assignedPapers[0]).to.equal(1);
    });
    
    it("Should not allow author to be a reviewer", async function () {
      await expect(
        peerReviewSystem.assignReviewer(1, author.address)
      ).to.be.revertedWith("Author cannot review own paper");
    });
    
    it("Should not allow non-reviewer to be assigned", async function () {
      await expect(
        peerReviewSystem.assignReviewer(1, addr4.address)
      ).to.be.revertedWith("Address must be a reviewer");
    });
    
    it("Should not allow duplicate reviewer assignments", async function () {
      await peerReviewSystem.assignReviewer(1, reviewer1.address);
      
      await expect(
        peerReviewSystem.assignReviewer(1, reviewer1.address)
      ).to.be.revertedWith("Reviewer already assigned to this paper");
    });
  });
  
  describe("Review Submission", function () {
    beforeEach(async function () {
      // Submit a paper
      await peerReviewSystem.connect(author).submitPaper("ipfsHash", "metadataHash", 2);
      
      // Assign reviewers
      await peerReviewSystem.assignReviewer(1, reviewer1.address);
      await peerReviewSystem.assignReviewer(1, reviewer2.address);
    });
    
    it("Should allow reviewer to submit review", async function () {
      const ipfsHash = "reviewHash1";
      const score = 8;
      const comments = "Good paper with minor issues";
      
      await expect(
        peerReviewSystem.connect(reviewer1).submitReview(1, ipfsHash, score, comments)
      )
        .to.emit(peerReviewSystem, "ReviewSubmitted")
            .withArgs(1, 1, reviewer1.address);

            const review = await peerReviewSystem.reviews(1);
            expect(review.paperId).to.equal(1);
            expect(review.reviewer).to.equal(reviewer1.address);
            expect(review.ipfsHash).to.equal(ipfsHash);
            expect(review.score).to.equal(score);
            expect(review.isRevealed).to.equal(false);
            expect(review.comments).to.equal(comments);
            });

            it("Should update paper status to Reviewed when min reviews are met", async function () {
            await peerReviewSystem.connect(reviewer1).submitReview(1, "review1", 7, "Nice paper");
            await peerReviewSystem.connect(reviewer2).submitReview(1, "review2", 9, "Excellent!");

            const paper = await peerReviewSystem.papers(1);
            expect(paper.status).to.equal(2); // Reviewed
            });

            it("Should reject reviews from unassigned reviewers", async function () {
            await expect(
            peerReviewSystem.connect(addr4).submitReview(1, "review3", 6, "Not bad")
            ).to.be.revertedWith("Reviewer not assigned to this paper");
            });

            it("Should reject scores outside of 1-10", async function () {
            await expect(
            peerReviewSystem.connect(reviewer1).submitReview(1, "review3", 11, "Too high")
            ).to.be.revertedWith("Score must be between 1 and 10");
            });
            });

            describe("Review Reveal", function () {
            beforeEach(async function () {
            await peerReviewSystem.connect(author).submitPaper("ipfsHash", "metadataHash", 1);
            await peerReviewSystem.assignReviewer(1, reviewer1.address);
            await peerReviewSystem.connect(reviewer1).submitReview(1, "reviewHash", 8, "Great job");
            });

            it("Should allow admin to reveal a review", async function () {
            await expect(peerReviewSystem.revealReview(1))
            .to.emit(peerReviewSystem, "ReviewRevealed")
            .withArgs(1, 1);

            const review = await peerReviewSystem.reviews(1);
            expect(review.isRevealed).to.equal(true);
            });

            it("Should reject reveal from non-admin", async function () {
            await expect(
            peerReviewSystem.connect(author).revealReview(1)
            ).to.be.revertedWith("Must have admin role");
            });
            });

            describe("Final Decision", function () {
            beforeEach(async function () {
            await peerReviewSystem.connect(author).submitPaper("ipfsHash", "metadataHash", 1);
            await peerReviewSystem.assignReviewer(1, reviewer1.address);
            await peerReviewSystem.connect(reviewer1).submitReview(1, "reviewHash", 8, "Nice work");
            });

            it("Should allow admin to accept a paper", async function () {
            await expect(peerReviewSystem.makeFinalDecision(1, true))
            .to.emit(peerReviewSystem, "PaperStatusChanged")
            .withArgs(1, 3); // Accepted

            const paper = await peerReviewSystem.papers(1);
            expect(paper.status).to.equal(3); // Accepted
            });

            it("Should allow admin to reject a paper", async function () {
            await expect(peerReviewSystem.makeFinalDecision(1, false))
            .to.emit(peerReviewSystem, "PaperStatusChanged")
            .withArgs(1, 4); // Rejected

            const paper = await peerReviewSystem.papers(1);
            expect(paper.status).to.equal(4); // Rejected
            });

            it("Should reject decision if paper not reviewed", async function () {
            // Submit a new paper that hasn't been reviewed
            await peerReviewSystem.connect(author).submitPaper("hash2", "meta2", 2);
            await expect(
            peerReviewSystem.makeFinalDecision(2, true)
            ).to.be.revertedWith("Paper must be in reviewed status");
            });
            });

            describe("Make Paper Public", function () {
            beforeEach(async function () {
            await peerReviewSystem.connect(author).submitPaper("ipfsHash", "metadataHash", 1);
            await peerReviewSystem.assignReviewer(1, reviewer1.address);
            await peerReviewSystem.connect(reviewer1).submitReview(1, "reviewHash", 9, "Excellent");
            await peerReviewSystem.makeFinalDecision(1, true); // Accepted
            });

            it("Should allow author to make accepted paper public", async function () {
            await peerReviewSystem.connect(author).makePublic(1);
            const paper = await peerReviewSystem.papers(1);
            expect(paper.isPublic).to.equal(true);
            });

            it("Should reject making paper public if not accepted", async function () {
            // Submit a paper, do not review/accept it
            await peerReviewSystem.connect(author).submitPaper("hashX", "metaX", 2);
            await expect(
            peerReviewSystem.connect(author).makePublic(2)
            ).to.be.revertedWith("Paper must be accepted");
            });
            });

            describe("Getters", function () {
            beforeEach(async function () {
            await peerReviewSystem.connect(author).submitPaper("ipfsHash", "metadataHash", 2);
            await peerReviewSystem.assignReviewer(1, reviewer1.address);
            await peerReviewSystem.assignReviewer(1, reviewer2.address);
            await peerReviewSystem.connect(reviewer1).submitReview(1, "review1", 7, "Good");
            await peerReviewSystem.connect(reviewer2).submitReview(1, "review2", 9, "Great");
            });

            it("Should return all papers by author", async function () {
            const papers = await peerReviewSystem.getPapersByAuthor(author.address);
            expect(papers.length).to.equal(1);
            expect(papers[0]).to.equal(1);
            });

            it("Should return all papers assigned to a reviewer", async function () {
            const reviewer1Papers = await peerReviewSystem.getPapersAssignedToReviewer(reviewer1.address);
            expect(reviewer1Papers).to.include(1);
            });

            it("Should return all review IDs for a paper", async function () {
            const reviewIds = await peerReviewSystem.getReviewsForPaper(1);
            expect(reviewIds.length).to.equal(2);
            expect(reviewIds[0]).to.equal(1);
            expect(reviewIds[1]).to.equal(2);
            });

            it("Should calculate average score correctly", async function () {
            const avgScore = await peerReviewSystem.getAverageScore(1);
            expect(avgScore).to.equal(8); // (7+9)/2 = 8
            });
            });
            });