// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingTemplate
 * @dev Template-based voting contract that can be configured and deployed multiple times
 */
contract VotingTemplate {
    struct VotingEvent {
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string ipfsHash;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) voteCounts;
        uint256 totalVotes;
    }

    address public admin;
    uint256 public eventCounter;
    mapping(uint256 => VotingEvent) public events;
    mapping(address => bool) public authorizedVoters;

    event VotingEventCreated(uint256 indexed eventId, string title, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed eventId, address indexed voter, uint256 optionIndex);
    event VoterAuthorized(address indexed voter);
    event EventFinalized(uint256 indexed eventId, string ipfsHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender], "Not an authorized voter");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedVoters[msg.sender] = true;
    }

    /**
     * @dev Create a new voting event
     */
    function createVotingEvent(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _startTime,
        uint256 _endTime,
        string memory _ipfsHash
    ) external onlyAdmin returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(_options.length >= 2, "Need at least 2 options");
        require(block.timestamp < _endTime, "End time must be in future");

        uint256 eventId = eventCounter++;
        VotingEvent storage newEvent = events[eventId];
        
        newEvent.title = _title;
        newEvent.description = _description;
        newEvent.options = _options;
        newEvent.startTime = _startTime;
        newEvent.endTime = _endTime;
        newEvent.isActive = true;
        newEvent.ipfsHash = _ipfsHash;
        newEvent.totalVotes = 0;

        emit VotingEventCreated(eventId, _title, _startTime, _endTime);
        return eventId;
    }

    /**
     * @dev Cast a vote
     */
    function castVote(uint256 _eventId, uint256 _optionIndex) external onlyAuthorizedVoter {
        VotingEvent storage votingEvent = events[_eventId];
        
        require(votingEvent.isActive, "Event is not active");
        require(block.timestamp >= votingEvent.startTime, "Voting has not started");
        require(block.timestamp <= votingEvent.endTime, "Voting has ended");
        require(!votingEvent.hasVoted[msg.sender], "Already voted");
        require(_optionIndex < votingEvent.options.length, "Invalid option");

        votingEvent.hasVoted[msg.sender] = true;
        votingEvent.voteCounts[_optionIndex]++;
        votingEvent.totalVotes++;

        emit VoteCast(_eventId, msg.sender, _optionIndex);
    }

    /**
     * @dev Authorize a voter
     */
    function authorizeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = true;
        emit VoterAuthorized(_voter);
    }

    /**
     * @dev Batch authorize voters
     */
    function authorizeVoters(address[] memory _voters) external onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            authorizedVoters[_voters[i]] = true;
            emit VoterAuthorized(_voters[i]);
        }
    }

    /**
     * @dev Finalize event and store results on IPFS
     */
    function finalizeEvent(uint256 _eventId, string memory _resultsIpfsHash) external onlyAdmin {
        VotingEvent storage votingEvent = events[_eventId];
        require(block.timestamp > votingEvent.endTime, "Event has not ended");
        
        votingEvent.isActive = false;
        votingEvent.ipfsHash = _resultsIpfsHash;

        emit EventFinalized(_eventId, _resultsIpfsHash);
    }

    /**
     * @dev Get vote results
     */
    function getResults(uint256 _eventId) external view returns (uint256[] memory) {
        VotingEvent storage votingEvent = events[_eventId];
        uint256[] memory results = new uint256[](votingEvent.options.length);
        
        for (uint256 i = 0; i < votingEvent.options.length; i++) {
            results[i] = votingEvent.voteCounts[i];
        }
        
        return results;
    }

    /**
     * @dev Check if address has voted
     */
    function hasVoted(uint256 _eventId, address _voter) external view returns (bool) {
        return events[_eventId].hasVoted[_voter];
    }

    /**
     * @dev Get event details
     */
    function getEventDetails(uint256 _eventId) external view returns (
        string memory title,
        string memory description,
        string[] memory options,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        uint256 totalVotes
    ) {
        VotingEvent storage votingEvent = events[_eventId];
        return (
            votingEvent.title,
            votingEvent.description,
            votingEvent.options,
            votingEvent.startTime,
            votingEvent.endTime,
            votingEvent.isActive,
            votingEvent.totalVotes
        );
    }
}
