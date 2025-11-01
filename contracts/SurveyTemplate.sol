// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SurveyTemplate
 * @dev Template-based survey contract for collecting feedback
 */
contract SurveyTemplate {
    struct Question {
        string text;
        string[] options;
        bool isMultipleChoice;
    }

    struct Survey {
        string title;
        string description;
        Question[] questions;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string ipfsHash;
        address creator;
        uint256 responseCount;
        mapping(address => bool) hasResponded;
    }

    address public admin;
    uint256 public surveyCounter;
    mapping(uint256 => Survey) public surveys;
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public responses; // surveyId => respondent => questionId => answerIndex
    mapping(address => bool) public authorizedRespondents;

    event SurveyCreated(uint256 indexed surveyId, string title, address creator);
    event SurveyResponseSubmitted(uint256 indexed surveyId, address indexed respondent);
    event SurveyFinalized(uint256 indexed surveyId, uint256 totalResponses, string ipfsHash);
    event RespondentAuthorized(address indexed respondent);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorizedRespondent() {
        require(authorizedRespondents[msg.sender], "Not an authorized respondent");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedRespondents[msg.sender] = true;
    }

    /**
     * @dev Create a new survey
     */
    function createSurvey(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string memory _ipfsHash
    ) external onlyAuthorizedRespondent returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(block.timestamp < _endTime, "End time must be in future");

        uint256 surveyId = surveyCounter++;
        Survey storage newSurvey = surveys[surveyId];
        
        newSurvey.title = _title;
        newSurvey.description = _description;
        newSurvey.startTime = _startTime;
        newSurvey.endTime = _endTime;
        newSurvey.isActive = true;
        newSurvey.ipfsHash = _ipfsHash;
        newSurvey.creator = msg.sender;
        newSurvey.responseCount = 0;

        emit SurveyCreated(surveyId, _title, msg.sender);
        return surveyId;
    }

    /**
     * @dev Add question to survey
     */
    function addQuestion(
        uint256 _surveyId,
        string memory _questionText,
        string[] memory _options,
        bool _isMultipleChoice
    ) external {
        Survey storage survey = surveys[_surveyId];
        require(msg.sender == survey.creator || msg.sender == admin, "Not authorized");
        require(block.timestamp < survey.startTime, "Survey already started");

        Question memory newQuestion = Question({
            text: _questionText,
            options: _options,
            isMultipleChoice: _isMultipleChoice
        });

        survey.questions.push(newQuestion);
    }

    /**
     * @dev Submit survey response
     */
    function submitResponse(uint256 _surveyId, uint256[] memory _answers) external onlyAuthorizedRespondent {
        Survey storage survey = surveys[_surveyId];
        
        require(survey.isActive, "Survey is not active");
        require(block.timestamp >= survey.startTime, "Survey has not started");
        require(block.timestamp <= survey.endTime, "Survey has ended");
        require(!survey.hasResponded[msg.sender], "Already responded");
        require(_answers.length == survey.questions.length, "Invalid number of answers");

        survey.hasResponded[msg.sender] = true;

        for (uint256 i = 0; i < _answers.length; i++) {
            require(_answers[i] < survey.questions[i].options.length, "Invalid answer");
            responses[_surveyId][msg.sender][i] = _answers[i];
        }

        survey.responseCount++;
        emit SurveyResponseSubmitted(_surveyId, msg.sender);
    }

    /**
     * @dev Authorize a respondent
     */
    function authorizeRespondent(address _respondent) external onlyAdmin {
        authorizedRespondents[_respondent] = true;
        emit RespondentAuthorized(_respondent);
    }

    /**
     * @dev Batch authorize respondents
     */
    function authorizeRespondents(address[] memory _respondents) external onlyAdmin {
        for (uint256 i = 0; i < _respondents.length; i++) {
            authorizedRespondents[_respondents[i]] = true;
            emit RespondentAuthorized(_respondents[i]);
        }
    }

    /**
     * @dev Finalize survey and store results on IPFS
     */
    function finalizeSurvey(uint256 _surveyId, string memory _resultsIpfsHash) external {
        Survey storage survey = surveys[_surveyId];
        require(
            msg.sender == survey.creator || msg.sender == admin,
            "Only creator or admin can finalize"
        );
        require(block.timestamp > survey.endTime, "Survey has not ended");
        
        survey.isActive = false;
        survey.ipfsHash = _resultsIpfsHash;

        emit SurveyFinalized(_surveyId, survey.responseCount, _resultsIpfsHash);
    }

    /**
     * @dev Get survey details
     */
    function getSurveyDetails(uint256 _surveyId) external view returns (
        string memory title,
        string memory description,
        uint256 questionCount,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        uint256 responseCount
    ) {
        Survey storage survey = surveys[_surveyId];
        return (
            survey.title,
            survey.description,
            survey.questions.length,
            survey.startTime,
            survey.endTime,
            survey.isActive,
            survey.responseCount
        );
    }

    /**
     * @dev Get question details
     */
    function getQuestion(uint256 _surveyId, uint256 _questionIndex) external view returns (
        string memory text,
        string[] memory options,
        bool isMultipleChoice
    ) {
        Survey storage survey = surveys[_surveyId];
        require(_questionIndex < survey.questions.length, "Invalid question index");
        
        Question storage question = survey.questions[_questionIndex];
        return (question.text, question.options, question.isMultipleChoice);
    }

    /**
     * @dev Check if address has responded
     */
    function hasResponded(uint256 _surveyId, address _respondent) external view returns (bool) {
        return surveys[_surveyId].hasResponded[_respondent];
    }
}
