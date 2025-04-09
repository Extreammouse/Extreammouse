// src/web3/api.js
import Web3 from 'web3';
import PeerReviewSystem from '../artifacts/contracts/PeerReviewSystem.sol/PeerReviewSystem.json';
import contractAddress from '../contracts/contract-address.json';

class Web3Api {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.networkId = null;
    this.isInitialized = false;
  }
  
  async init() {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3 instance
        this.web3 = new Web3(window.ethereum);
        
        // Get network ID
        this.networkId = await this.web3.eth.net.getId();
        
        // Get user account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        
        // Initialize the contract
        this.contract = new this.web3.eth.Contract(
          PeerReviewSystem.abi,
          contractAddress.PeerReviewSystem
        );
        
        this.isInitialized = true;
        
        // Setup event listeners for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          this.account = accounts[0];
        });
        
        // Setup event listeners for network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        
        return {
          web3: this.web3,
          account: this.account,
          networkId: this.networkId
        };
      } catch (error) {
        console.error("Error initializing Web3:", error);
        throw error;
      }
    } else {
      throw new Error("MetaMask is not installed. Please install MetaMask and try again.");
    }
  }
  
  async submitPaper(ipfsHash, metadataHash, minReviewsRequired) {
    if (!this.isInitialized) await this.init();
    
    try {
      const result = await this.contract.methods
        .submitPaper(ipfsHash, metadataHash, minReviewsRequired)
        .send({ from: this.account });
      
      // Find the PaperSubmitted event to get the paperId
      const paperId = result.events.PaperSubmitted.returnValues.paperId;
      
      return {
        paperId,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error("Error submitting paper:", error);
      throw error;
    }
  }
  
  async getPapersByAuthor(authorAddress) {
    if (!this.isInitialized) await this.init();
    
    try {
      const paperIds = await this.contract.methods
        .getPapersByAuthor(authorAddress || this.account)
        .call();
      
      return paperIds;
    } catch (error) {
      console.error("Error getting papers by author:", error);
      throw error;
    }
  }
  
  async getPaper(paperId) {
    if (!this.isInitialized) await this.init();
    
    try {
      const paper = await this.contract.methods.papers(paperId).call();
      
      return {
        id: paper.id,
        author: paper.author,
        ipfsHash: paper.ipfsHash,
        metadataHash: paper.metadataHash,
        status: parseInt(paper.status),
        submissionTime: new Date(paper.submissionTime * 1000),
        minReviewsRequired: paper.minReviewsRequired,
        isPublic: paper.isPublic
      };
    } catch (error) {
      console.error("Error getting paper:", error);
      throw error;
    }
  }
  
  async getReviewsForPaper(paperId) {
    if (!this.isInitialized) await this.init();
    
    try {
      const reviewIds = await this.contract.methods
        .getReviewsForPaper(paperId)
        .call();
      
      const reviews = await Promise.all(
        reviewIds.map(async (id) => {
          const review = await this.contract.methods.reviews(id).call();
          
          return {
            id: review.id,
            paperId: review.paperId,
            reviewer: review.reviewer,
            ipfsHash: review.ipfsHash,
            score: review.score,
            isRevealed: review.isRevealed,
            submissionTime: new Date(review.submissionTime * 1000),
            comments: review.comments
          };
        })
      );
      
      return reviews;
    } catch (error) {
      console.error("Error getting reviews for paper:", error);
      throw error;
    }
  }
  
  async submitReview(paperId, ipfsHash, score, comments) {
    if (!this.isInitialized) await this.init();
    
    try {
      const result = await this.contract.methods
        .submitReview(paperId, ipfsHash, score, comments)
        .send({ from: this.account });
      
      // Find the ReviewSubmitted event to get the reviewId
      const reviewId = result.events.ReviewSubmitted.returnValues.reviewId;
      
      return {
        reviewId,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  }
  
  async getPapersAssignedToReviewer(reviewerAddress) {
    if (!this.isInitialized) await this.init();
    
    try {
      const paperIds = await this.contract.methods
        .getPapersAssignedToReviewer(reviewerAddress || this.account)
        .call();
      
      return paperIds;
    } catch (error) {
      console.error("Error getting papers assigned to reviewer:", error);
      throw error;
    }
  }
  
  async hasRole(role, address) {
    if (!this.isInitialized) await this.init();
    
    try {
      const roleHash = this.web3.utils.keccak256(role);
      const hasRole = await this.contract.methods
        .hasRole(roleHash, address || this.account)
        .call();
      
      return hasRole;
    } catch (error) {
      console.error("Error checking role:", error);
      throw error;
    }
  }
  
  async getAverageScore(paperId) {
    if (!this.isInitialized) await this.init();
    
    try {
      const score = await this.contract.methods
        .getAverageScore(paperId)
        .call();
      
      return score;
    } catch (error) {
      console.error("Error getting average score:", error);
      throw error;
    }
  }
  
  getPaperStatusName(statusCode) {
    const statuses = ['Submitted', 'UnderReview', 'Reviewed', 'Accepted', 'Rejected'];
    return statuses[statusCode] || 'Unknown';
  }
}

// Export a singleton instance
export default new Web3Api();