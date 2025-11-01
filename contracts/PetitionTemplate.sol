// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PetitionTemplate
 * @dev Template-based petition contract for collecting signatures
 */
contract PetitionTemplate {
    struct Petition {
        string title;
        string description;
        uint256 targetSignatures;
        uint256 currentSignatures;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string ipfsHash;
        address creator;
        mapping(address => bool) hasSigned;
        mapping(address => string) signatureComments;
    }

    address public admin;
    uint256 public petitionCounter;
    mapping(uint256 => Petition) public petitions;
    mapping(address => bool) public authorizedSigners;

    event PetitionCreated(uint256 indexed petitionId, string title, address creator, uint256 targetSignatures);
    event PetitionSigned(uint256 indexed petitionId, address indexed signer, string comment);
    event PetitionFinalized(uint256 indexed petitionId, uint256 finalSignatures, string ipfsHash);
    event SignerAuthorized(address indexed signer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorizedSigner() {
        require(authorizedSigners[msg.sender], "Not an authorized signer");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedSigners[msg.sender] = true;
    }

    /**
     * @dev Create a new petition
     */
    function createPetition(
        string memory _title,
        string memory _description,
        uint256 _targetSignatures,
        uint256 _startTime,
        uint256 _endTime,
        string memory _ipfsHash
    ) external onlyAuthorizedSigner returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(_targetSignatures > 0, "Target must be greater than 0");
        require(block.timestamp < _endTime, "End time must be in future");

        uint256 petitionId = petitionCounter++;
        Petition storage newPetition = petitions[petitionId];
        
        newPetition.title = _title;
        newPetition.description = _description;
        newPetition.targetSignatures = _targetSignatures;
        newPetition.currentSignatures = 0;
        newPetition.startTime = _startTime;
        newPetition.endTime = _endTime;
        newPetition.isActive = true;
        newPetition.ipfsHash = _ipfsHash;
        newPetition.creator = msg.sender;

        emit PetitionCreated(petitionId, _title, msg.sender, _targetSignatures);
        return petitionId;
    }

    /**
     * @dev Sign a petition
     */
    function signPetition(uint256 _petitionId, string memory _comment) external onlyAuthorizedSigner {
        Petition storage petition = petitions[_petitionId];
        
        require(petition.isActive, "Petition is not active");
        require(block.timestamp >= petition.startTime, "Petition has not started");
        require(block.timestamp <= petition.endTime, "Petition has ended");
        require(!petition.hasSigned[msg.sender], "Already signed");

        petition.hasSigned[msg.sender] = true;
        petition.signatureComments[msg.sender] = _comment;
        petition.currentSignatures++;

        emit PetitionSigned(_petitionId, msg.sender, _comment);
    }

    /**
     * @dev Authorize a signer
     */
    function authorizeSigner(address _signer) external onlyAdmin {
        authorizedSigners[_signer] = true;
        emit SignerAuthorized(_signer);
    }

    /**
     * @dev Batch authorize signers
     */
    function authorizeSigners(address[] memory _signers) external onlyAdmin {
        for (uint256 i = 0; i < _signers.length; i++) {
            authorizedSigners[_signers[i]] = true;
            emit SignerAuthorized(_signers[i]);
        }
    }

    /**
     * @dev Finalize petition and store results on IPFS
     */
    function finalizePetition(uint256 _petitionId, string memory _resultsIpfsHash) external {
        Petition storage petition = petitions[_petitionId];
        require(
            msg.sender == petition.creator || msg.sender == admin,
            "Only creator or admin can finalize"
        );
        require(block.timestamp > petition.endTime, "Petition has not ended");
        
        petition.isActive = false;
        petition.ipfsHash = _resultsIpfsHash;

        emit PetitionFinalized(_petitionId, petition.currentSignatures, _resultsIpfsHash);
    }

    /**
     * @dev Check if address has signed
     */
    function hasSigned(uint256 _petitionId, address _signer) external view returns (bool) {
        return petitions[_petitionId].hasSigned[_signer];
    }

    /**
     * @dev Get signer's comment
     */
    function getSignerComment(uint256 _petitionId, address _signer) external view returns (string memory) {
        return petitions[_petitionId].signatureComments[_signer];
    }

    /**
     * @dev Get petition details
     */
    function getPetitionDetails(uint256 _petitionId) external view returns (
        string memory title,
        string memory description,
        uint256 targetSignatures,
        uint256 currentSignatures,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        address creator
    ) {
        Petition storage petition = petitions[_petitionId];
        return (
            petition.title,
            petition.description,
            petition.targetSignatures,
            petition.currentSignatures,
            petition.startTime,
            petition.endTime,
            petition.isActive,
            petition.creator
        );
    }

    /**
     * @dev Check if petition reached target
     */
    function hasReachedTarget(uint256 _petitionId) external view returns (bool) {
        Petition storage petition = petitions[_petitionId];
        return petition.currentSignatures >= petition.targetSignatures;
    }
}
