// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PeerReviewSystem
 * @dev Smart contract for decentralized peer review of research papers
 */
contract PeerReviewSystem is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    
    Counters.Counter private _paperIds;
    Counters.Counter private _reviewIds;

    // Paper status enum
    enum PaperStatus { Submitted, UnderReview, Reviewed, Accepted, Rejected }
    
    // Paper struct
    struct Paper {
        uint256 id;
        address author;
        string ipfsHash;  // IPFS hash of the paper
        string metadataHash;  // IPFS hash of paper metadata (title, abstract, etc.)
        PaperStatus status;
        uint256 submissionTime;
        uint256[] reviewIds;
        uint8 minReviewsRequired;
        bool isPublic;
    }
    
    // Review struct
    struct Review {
        uint256 id;
        uint256 paperId;
        address reviewer;
        string ipfsHash;  // IPFS hash of the review content
        uint8 score;  // Score from 1-10
        bool isRevealed;
        uint256 submissionTime;
        string comments;
    }
    
    // Mapping of paper ID to Paper struct
    mapping(uint256 => Paper) public papers;
    
    // Mapping of review ID to Review struct
    mapping(uint256 => Review) public reviews;
    
    // Mapping of reviewer address to assigned paper IDs
    mapping(address => uint256[]) public reviewerAssignments;
    
    // Mapping of author address to paper IDs
    mapping(address => uint256[]) public authorPapers;
    
    // Events
    event PaperSubmitted(uint256 indexed paperId, address indexed author, string ipfsHash);
    event ReviewerAssigned(uint256 indexed paperId, address indexed reviewer);
    event ReviewSubmitted(uint256 indexed reviewId, uint256 indexed paperId, address indexed reviewer);
    event ReviewRevealed(uint256 indexed reviewId, uint256 indexed paperId);
    event PaperStatusChanged(uint256 indexed paperId, PaperStatus status);
    
    /**
     * @dev Constructor sets the contract deployer as the admin
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Submit a new paper for review
     * @param _ipfsHash IPFS hash of the paper content
     * @param _metadataHash IPFS hash of paper metadata
     * @param _minReviewsRequired Minimum number of reviews required
     */
    function submitPaper(
        string memory _ipfsHash,
        string memory _metadataHash,
        uint8 _minReviewsRequired
    ) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_minReviewsRequired >= 2, "At least 2 reviews required");
        
        _paperIds.increment();
        uint256 newPaperId = _paperIds.current();
        
        Paper storage newPaper = papers[newPaperId];
        newPaper.id = newPaperId;
        newPaper.author = msg.sender;
        newPaper.ipfsHash = _ipfsHash;
        newPaper.metadataHash = _metadataHash;
        newPaper.status = PaperStatus.Submitted;
        newPaper.submissionTime = block.timestamp;
        newPaper.minReviewsRequired = _minReviewsRequired;
        newPaper.isPublic = false;
        
        authorPapers[msg.sender].push(newPaperId);
        
        emit PaperSubmitted(newPaperId, msg.sender, _ipfsHash);
    }
    
    /**
     * @dev Assign a reviewer to a paper
     * @param _paperId ID of the paper
     * @param _reviewer Address of the reviewer
     */
    function assignReviewer(uint256 _paperId, address _reviewer) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(papers[_paperId].id != 0, "Paper does not exist");
        require(papers[_paperId].author != _reviewer, "Author cannot review own paper");
        require(hasRole(REVIEWER_ROLE, _reviewer), "Address must be a reviewer");
        
        // Check if reviewer is already assigned
        bool alreadyAssigned = false;
        for (uint i = 0; i < reviewerAssignments[_reviewer].length; i++) {
            if (reviewerAssignments[_reviewer][i] == _paperId) {
                alreadyAssigned = true;
                break;
            }
        }
        require(!alreadyAssigned, "Reviewer already assigned to this paper");
        
        reviewerAssignments[_reviewer].push(_paperId);
        
        if (papers[_paperId].status == PaperStatus.Submitted) {
            papers[_paperId].status = PaperStatus.UnderReview;
            emit PaperStatusChanged(_paperId, PaperStatus.UnderReview);
        }
        
        emit ReviewerAssigned(_paperId, _reviewer);
    }
    
    /**
     * @dev Submit a review for a paper
     * @param _paperId ID of the paper being reviewed
     * @param _ipfsHash IPFS hash of the review content
     * @param _score Score from 1-10
     * @param _comments Comments from reviewer
     */
    function submitReview(
        uint256 _paperId,
        string memory _ipfsHash,
        uint8 _score,
        string memory _comments
    ) public {
        require(hasRole(REVIEWER_ROLE, msg.sender), "Must have reviewer role");
        require(papers[_paperId].id != 0, "Paper does not exist");
        require(_score >= 1 && _score <= 10, "Score must be between 1 and 10");
        
        // Check if reviewer is assigned to this paper
        bool isAssigned = false;
        for (uint i = 0; i < reviewerAssignments[msg.sender].length; i++) {
            if (reviewerAssignments[msg.sender][i] == _paperId) {
                isAssigned = true;
                break;
            }
        }
        require(isAssigned, "Reviewer not assigned to this paper");
        
        _reviewIds.increment();
        uint256 newReviewId = _reviewIds.current();
        
        Review storage newReview = reviews[newReviewId];
        newReview.id = newReviewId;
        newReview.paperId = _paperId;
        newReview.reviewer = msg.sender;
        newReview.ipfsHash = _ipfsHash;
        newReview.score = _score;
        newReview.isRevealed = false;
        newReview.submissionTime = block.timestamp;
        newReview.comments = _comments;
        
        papers[_paperId].reviewIds.push(newReviewId);
        
        // Check if we have enough reviews to change status
        if (papers[_paperId].reviewIds.length >= papers[_paperId].minReviewsRequired) {
            papers[_paperId].status = PaperStatus.Reviewed;
            emit PaperStatusChanged(_paperId, PaperStatus.Reviewed);
        }
        
        emit ReviewSubmitted(newReviewId, _paperId, msg.sender);
    }
    
    /**
     * @dev Reveal a review (make it publicly accessible)
     * @param _reviewId ID of the review
     */
    function revealReview(uint256 _reviewId) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(reviews[_reviewId].id != 0, "Review does not exist");
        
        reviews[_reviewId].isRevealed = true;
        
        emit ReviewRevealed(_reviewId, reviews[_reviewId].paperId);
    }
    
    /**
     * @dev Make a final decision on a paper
     * @param _paperId ID of the paper
     * @param _accepted Whether the paper is accepted or rejected
     */
    function makeFinalDecision(uint256 _paperId, bool _accepted) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(papers[_paperId].id != 0, "Paper does not exist");
        require(papers[_paperId].status == PaperStatus.Reviewed, "Paper must be in reviewed status");
        
        papers[_paperId].status = _accepted ? PaperStatus.Accepted : PaperStatus.Rejected;
        emit PaperStatusChanged(_paperId, papers[_paperId].status);
    }
    
    /**
     * @dev Make a paper public
     * @param _paperId ID of the paper
     */
    function makePublic(uint256 _paperId) public {
        require(hasRole(ADMIN_ROLE, msg.sender) || papers[_paperId].author == msg.sender, "Not authorized");
        require(papers[_paperId].id != 0, "Paper does not exist");
        require(papers[_paperId].status == PaperStatus.Accepted, "Paper must be accepted");
        
        papers[_paperId].isPublic = true;
    }
    
    /**
     * @dev Add a reviewer role to an address
     * @param _reviewer Address to be given reviewer role
     */
    function addReviewer(address _reviewer) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        grantRole(REVIEWER_ROLE, _reviewer);
    }
    
    /**
     * @dev Remove a reviewer role from an address
     * @param _reviewer Address to have reviewer role revoked
     */
    function removeReviewer(address _reviewer) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        revokeRole(REVIEWER_ROLE, _reviewer);
    }
    
    /**
     * @dev Get all papers by an author
     * @param _author Address of the author
     */
    function getPapersByAuthor(address _author) public view returns (uint256[] memory) {
        return authorPapers[_author];
    }
    
    /**
     * @dev Get all papers assigned to a reviewer
     * @param _reviewer Address of the reviewer
     */
    function getPapersAssignedToReviewer(address _reviewer) public view returns (uint256[] memory) {
        return reviewerAssignments[_reviewer];
    }
    
    /**
     * @dev Get all review IDs for a paper
     * @param _paperId ID of the paper
     */
    function getReviewsForPaper(uint256 _paperId) public view returns (uint256[] memory) {
        require(papers[_paperId].id != 0, "Paper does not exist");
        return papers[_paperId].reviewIds;
    }
    
    /**
     * @dev Get average score for a paper
     * @param _paperId ID of the paper
     */
    function getAverageScore(uint256 _paperId) public view returns (uint8) {
        require(papers[_paperId].id != 0, "Paper does not exist");
        if (papers[_paperId].reviewIds.length == 0) {
            return 0;
        }
        
        uint256 totalScore = 0;
        for (uint i = 0; i < papers[_paperId].reviewIds.length; i++) {
            totalScore += reviews[papers[_paperId].reviewIds[i]].score;
        }
        
        return uint8(totalScore / papers[_paperId].reviewIds.length);
    }
}