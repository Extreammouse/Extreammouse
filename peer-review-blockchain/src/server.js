// src/server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import util from 'util';
import path from 'path';
import dotenv from 'dotenv';

import IPFSService from './services/ipfsService.js';
import BlockchainService from './services/blockchainService.js';

dotenv.config();

const fileUpload = multer({ dest: 'uploads/' });
const unlink = util.promisify(fs.unlink);

// Initialize services
const ipfsService = new IPFSService();
const blockchainService = new BlockchainService(
  process.env.CONTRACT_ADDRESS,
  process.env.PROVIDER_URL
);
// Make sure to provide the private key when initializing
blockchainService.initialize(process.env.PRIVATE_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

// Submit a paper
app.post('/api/papers', fileUpload.single('paper'), async (req, res) => {
  try {
    const { title, abstract, authors, keywords, minReviewsRequired } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Upload paper to IPFS
    const paperHash = await ipfsService.uploadFileFromPath(req.file.path);
    
    // Create and upload metadata
    const metadata = {
      title,
      abstract,
      authors,
      keywords: keywords.split(',').map(k => k.trim()),
      timestamp: Date.now()
    };
    const metadataHash = await ipfsService.uploadPaperMetadata(metadata);
    
    // Submit paper to blockchain
    const result = await blockchainService.submitPaper(
      paperHash, 
      metadataHash, 
      parseInt(minReviewsRequired || 2)
    );
    
    // Clean up uploaded file
    await unlink(req.file.path);
    
    res.status(201).json({
      paperId: result.paperId,
      ipfsHash: paperHash,
      metadataHash: metadataHash,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Error submitting paper:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all papers by author
app.get('/api/papers/author/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const paperIds = await blockchainService.getPapersByAuthor(address);
    
    const papers = await Promise.all(
      paperIds.map(async (id) => {
        const paperDetails = await blockchainService.getPaper(id);
        
        // Get metadata from IPFS if available
        let metadata = {};
        try {
          metadata = await ipfsService.getMetadata(paperDetails.metadataHash);
        } catch (err) {
          console.warn(`Could not fetch metadata for paper ${id}:`, err);
        }
        
        return {
          ...paperDetails,
          metadata
        };
      })
    );
    
    res.json(papers);
  } catch (error) {
    console.error('Error getting papers by author:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific paper details
app.get('/api/papers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paperDetails = await blockchainService.getPaper(parseInt(id));
    
    // Get metadata from IPFS
    let metadata = {};
    try {
      metadata = await ipfsService.getMetadata(paperDetails.metadataHash);
    } catch (err) {
      console.warn(`Could not fetch metadata for paper ${id}:`, err);
    }
    
    // Get average score
    const averageScore = await blockchainService.getAverageScore(parseInt(id));
    
    res.json({
      ...paperDetails,
      metadata,
      averageScore
    });
  } catch (error) {
    console.error('Error getting paper details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign reviewer to paper
app.post('/api/papers/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerAddress } = req.body;
    
    const result = await blockchainService.assignReviewer(parseInt(id), reviewerAddress);
    
    res.json({
      paperId: parseInt(id),
      reviewerAddress,
      transactionHash: result.hash // Updated for ethers v6
    });
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit review
app.post('/api/papers/:id/reviews', fileUpload.single('review'), async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comments } = req.body;
    
    // Upload review to IPFS
    let reviewHash;
    if (req.file) {
      reviewHash = await ipfsService.uploadFileFromPath(req.file.path);
      // Clean up uploaded file
      await unlink(req.file.path);
    } else {
      // If no file, upload comments as review content
      reviewHash = await ipfsService.uploadFile(comments);
    }
    
    // Submit review to blockchain
    const result = await blockchainService.submitReview(
      parseInt(id),
      reviewHash,
      parseInt(score),
      comments
    );
    
    res.status(201).json({
      reviewId: result.reviewId,
      paperId: parseInt(id),
      ipfsHash: reviewHash,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Make final decision on paper
app.post('/api/papers/:id/decision', async (req, res) => {
  try {
    const { id } = req.params;
    const { accepted } = req.body;
    
    const result = await blockchainService.makeFinalDecision(parseInt(id), accepted);
    
    res.json({
      paperId: parseInt(id),
      accepted,
      transactionHash: result.hash // Updated for ethers v6
    });
  } catch (error) {
    console.error('Error making decision:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add reviewer role
app.post('/api/reviewers', async (req, res) => {
  try {
    const { reviewerAddress } = req.body;
    
    const result = await blockchainService.addReviewer(reviewerAddress);
    
    res.json({
      reviewerAddress,
      transactionHash: result.hash // Updated for ethers v6
    });
  } catch (error) {
    console.error('Error adding reviewer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get papers assigned to reviewer
app.get('/api/reviewers/:address/papers', async (req, res) => {
  try {
    const { address } = req.params;
    const paperIds = await blockchainService.contract.getPapersAssignedToReviewer(address);
    
    const papers = await Promise.all(
      paperIds.map(async (id) => {
        const paperDetails = await blockchainService.getPaper(id.toNumber());
        
        // Get metadata from IPFS
        let metadata = {};
        try {
          metadata = await ipfsService.getMetadata(paperDetails.metadataHash);
        } catch (err) {
          console.warn(`Could not fetch metadata for paper ${id}:`, err);
        }
        
        return {
          ...paperDetails,
          metadata
        };
      })
    );
    
    res.json(papers);
  } catch (error) {
    console.error('Error getting papers assigned to reviewer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Make paper public
app.post('/api/papers/:id/public', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await blockchainService.makePublic(parseInt(id));
    
    res.json({
      paperId: parseInt(id),
      transactionHash: result.hash // Updated for ethers v6
    });
  } catch (error) {
    console.error('Error making paper public:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download paper from IPFS
app.get('/api/download/paper/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const content = await ipfsService.getContent(hash);
    
    // Set appropriate headers for file download
    res.set('Content-Disposition', `attachment; filename="paper-${hash}.pdf"`);
    res.set('Content-Type', 'application/pdf');
    
    res.send(content);
  } catch (error) {
    console.error('Error downloading paper:', error);
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/ipfs/status', async (req, res) => {
  try {
    // Attempt a simple IPFS operation
    const testHash = await ipfsService.uploadFile('IPFS connection test');
    res.json({ 
      status: 'connected', 
      testHash 
    });
  } catch (error) {
    console.error('IPFS connection error:', error);
    res.status(500).json({ 
      status: 'disconnected', 
      error: error.message 
    });
  }
});
// Download review from IPFS
app.get('/api/download/review/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const content = await ipfsService.getContent(hash);
    
    // Set appropriate headers for file download
    res.set('Content-Disposition', `attachment; filename="review-${hash}.pdf"`);
    res.set('Content-Type', 'application/pdf');
    
    res.send(content);
  } catch (error) {
    console.error('Error downloading review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;