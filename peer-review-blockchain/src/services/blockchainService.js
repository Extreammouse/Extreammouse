// src/services/blockchainService.js
import { ethers } from 'ethers';
// Fix the import path to point to the actual location of your artifacts
import PeerReviewSystem from '../../artifacts/contracts/PeerReviewSystem.sol/PeerReviewSystem.json' with { type: "json" };
import dotenv from 'dotenv';

dotenv.config();

class BlockchainService {
  constructor(contractAddress, providerUrl = process.env.PROVIDER_URL || 'http://localhost:8545') {
    this.contractAddress = contractAddress;
    this.providerUrl = providerUrl;
    // Updated for ethers v6
    this.provider = new ethers.JsonRpcProvider(this.providerUrl);
    this.contract = null;
    this.wallet = null;
    this.signer = null;
  }

  /**
   * Initialize the service with a private key
   * @param {string} privateKey - The private key for transaction signing
   */
  initialize(privateKey = process.env.PRIVATE_KEY) {
    // Updated for ethers v6
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.signer = this.wallet;
    this.contract = new ethers.Contract(
      this.contractAddress,
      PeerReviewSystem.abi,
      this.signer
    );
  }

  /**
   * Submit a paper to the blockchain
   * @param {string} ipfsHash - IPFS hash of the paper content
   * @param {string} metadataHash - IPFS hash of paper metadata
   * @param {number} minReviewsRequired - Minimum number of reviews required
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async submitPaper(ipfsHash, metadataHash, minReviewsRequired) {
    try {
      const tx = await this.contract.submitPaper(ipfsHash, metadataHash, minReviewsRequired);
      const receipt = await tx.wait();
      
      // Find the PaperSubmitted event to get the paperId
      // Updated for ethers v6 log handling
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          return parsedLog.name === 'PaperSubmitted';
        } catch (e) {
          return false;
        }
      });
      
      if (!event) {
        throw new Error('PaperSubmitted event not found in transaction receipt');
      }
      
      const parsedEvent = this.contract.interface.parseLog(event);
      const paperId = parsedEvent.args.paperId.toNumber();
      
      return {
        paperId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error submitting paper:', error);
      throw error;
    }
  }

  /**
   * Assign a reviewer to a paper
   * @param {number} paperId - ID of the paper
   * @param {string} reviewerAddress - Address of the reviewer
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async assignReviewer(paperId, reviewerAddress) {
    try {
      const tx = await this.contract.assignReviewer(paperId, reviewerAddress);
      return await tx.wait();
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      throw error;
    }
  }

  /**
   * Submit a review for a paper
   * @param {number} paperId - ID of the paper being reviewed
   * @param {string} ipfsHash - IPFS hash of the review content
   * @param {number} score - Score from 1-10
   * @param {string} comments - Comments from reviewer
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async submitReview(paperId, ipfsHash, score, comments) {
    try {
      const tx = await this.contract.submitReview(paperId, ipfsHash, score, comments);
      const receipt = await tx.wait();
      
      // Find the ReviewSubmitted event to get the reviewId
      // Updated for ethers v6 log handling
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          return parsedLog.name === 'ReviewSubmitted';
        } catch (e) {
          return false;
        }
      });
      
      if (!event) {
        throw new Error('ReviewSubmitted event not found in transaction receipt');
      }
      
      const parsedEvent = this.contract.interface.parseLog(event);
      const reviewId = parsedEvent.args.reviewId.toNumber();
      
      return {
        reviewId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Reveal a review (make it publicly accessible)
   * @param {number} reviewId - ID of the review
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async revealReview(reviewId) {
    try {
      const tx = await this.contract.revealReview(reviewId);
      return await tx.wait();
    } catch (error) {
      console.error('Error revealing review:', error);
      throw error;
    }
  }

  /**
   * Make a final decision on a paper
   * @param {number} paperId - ID of the paper
   * @param {boolean} accepted - Whether the paper is accepted or rejected
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async makeFinalDecision(paperId, accepted) {
    try {
      const tx = await this.contract.makeFinalDecision(paperId, accepted);
      return await tx.wait();
    } catch (error) {
      console.error('Error making final decision:', error);
      throw error;
    }
  }

  /**
   * Make a paper public
   * @param {number} paperId - ID of the paper
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async makePublic(paperId) {
    try {
      const tx = await this.contract.makePublic(paperId);
      return await tx.wait();
    } catch (error) {
      console.error('Error making paper public:', error);
      throw error;
    }
  }

  /**
   * Add a reviewer role to an address
   * @param {string} reviewerAddress - Address to be given reviewer role
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async addReviewer(reviewerAddress) {
    try {
      const tx = await this.contract.addReviewer(reviewerAddress);
      return await tx.wait();
    } catch (error) {
      console.error('Error adding reviewer:', error);
      throw error;
    }
  }

  /**
   * Get all papers by an author
   * @param {string} authorAddress - Address of the author
   * @returns {Promise<number[]>} - Array of paper IDs
   */
  async getPapersByAuthor(authorAddress) {
    try {
      const paperIds = await this.contract.getPapersByAuthor(authorAddress);
      return paperIds.map(id => id.toNumber());
    } catch (error) {
      console.error('Error getting papers by author:', error);
      throw error;
    }
  }

  /**
   * Get paper details
   * @param {number} paperId - ID of the paper
   * @returns {Promise<Object>} - Paper details
   */
  async getPaper(paperId) {
    try {
      const paper = await this.contract.papers(paperId);
      return {
        id: paper.id.toNumber(),
        author: paper.author,
        ipfsHash: paper.ipfsHash,
        metadataHash: paper.metadataHash,
        status: paper.status,
        submissionTime: new Date(paper.submissionTime.toNumber() * 1000),
        minReviewsRequired: paper.minReviewsRequired,
        isPublic: paper.isPublic
      };
    } catch (error) {
      console.error('Error getting paper details:', error);
      throw error;
    }
  }

  /**
   * Get average score for a paper
   * @param {number} paperId - ID of the paper
   * @returns {Promise<number>} - Average score
   */
  async getAverageScore(paperId) {
    try {
      const score = await this.contract.getAverageScore(paperId);
      return score;
    } catch (error) {
      console.error('Error getting average score:', error);
      throw error;
    }
  }
}

export default BlockchainService;