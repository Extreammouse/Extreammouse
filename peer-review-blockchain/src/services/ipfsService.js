// src/services/ipfsService.js
import { create } from 'ipfs-http-client';
import { readFile } from 'fs/promises';

class IPFSService {
  constructor(ipfsApiUrl = 'https://ipfs.infura.io:5001') {
    // Connect to the IPFS node
    this.ipfs = create({
      url: ipfsApiUrl
    });
  }

  /**
   * Upload a file to IPFS
   * @param {Buffer|string} fileContent - The content to upload
   * @returns {Promise<string>} - The IPFS hash (CID) of the uploaded content
   */
  async uploadFile(fileContent) {
    try {
      const content = Buffer.isBuffer(fileContent)
        ? fileContent
        : Buffer.from(fileContent);
      const result = await this.ipfs.add(content);
      return result.cid.toString();
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload a file from path to IPFS
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - The IPFS hash (CID) of the uploaded file
   */
  async uploadFileFromPath(filePath) {
    try {
      const fileContent = await readFile(filePath);
      return this.uploadFile(fileContent);
    } catch (error) {
      console.error('Error reading or uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload paper metadata to IPFS
   * @param {Object} metadata - Paper metadata
   * @returns {Promise<string>} - The IPFS hash (CID) of the uploaded metadata
   */
  async uploadPaperMetadata(metadata) {
    try {
      const metadataString = JSON.stringify(metadata);
      return this.uploadFile(metadataString);
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Fetch content from IPFS by its hash
   * @param {string} ipfsHash - The IPFS hash (CID)
   * @returns {Promise<Buffer>} - The retrieved content
   */
  async getContent(ipfsHash) {
    try {
      const content = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        content.push(chunk);
      }
      return Buffer.concat(content);
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      throw error;
    }
  }

  /**
   * Fetch and parse JSON metadata from IPFS
   * @param {string} ipfsHash - The IPFS hash (CID) of the metadata
   * @returns {Promise<Object>} - The parsed metadata object
   */
  async getMetadata(ipfsHash) {
    try {
      const contentBuffer = await this.getContent(ipfsHash);
      const contentString = contentBuffer.toString();
      return JSON.parse(contentString);
    } catch (error) {
      console.error('Error parsing metadata from IPFS:', error);
      throw error;
    }
  }
}

export default IPFSService;