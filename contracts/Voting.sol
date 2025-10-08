// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    enum Phase { Registration, Voting, Ended }
    Phase public phase;

    string[] public proposals;

    mapping(address => bool) private registered;
    mapping(address => bool) private hasVoted;
    mapping(uint256 => uint256) private votes;

    uint256 public totalRegistered;
    uint256 public totalVotes;

    event VoterRegistered(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed proposalIndex);
    event PhaseChanged(Phase oldPhase, Phase newPhase);
    event ProposalAdded(uint256 indexed index, string proposal);

    constructor(string[] memory initialProposals) Ownable(msg.sender) {
        phase = Phase.Registration;
        for (uint256 i = 0; i < initialProposals.length; i++) {
            proposals.push(initialProposals[i]);
            emit ProposalAdded(i, initialProposals[i]);
        }
    }

    modifier inPhase(Phase expected) {
        require(phase == expected, "Invalid phase");
        _;
    }

    modifier onlyRegistered() {
        require(registered[msg.sender], "Not registered");
        _;
    }

    function addProposal(string calldata proposal) external onlyOwner inPhase(Phase.Registration) {
        proposals.push(proposal);
        emit ProposalAdded(proposals.length - 1, proposal);
    }

    function advancePhase() external onlyOwner {
        Phase old = phase;
        if (phase == Phase.Registration) phase = Phase.Voting;
        else if (phase == Phase.Voting) phase = Phase.Ended;
        else revert("Already ended");
        emit PhaseChanged(old, phase);
    }

    function resetElection(string[] calldata newProposals) external onlyOwner inPhase(Phase.Ended) {
        delete proposals;
        totalRegistered = 0;
        totalVotes = 0;
        for (uint256 i = 0; i < newProposals.length; i++) {
            proposals.push(newProposals[i]);
            emit ProposalAdded(i, newProposals[i]);
        }
        Phase old = phase;
        phase = Phase.Registration;
        emit PhaseChanged(old, phase);
    }

    function register() external inPhase(Phase.Registration) {
        require(!registered[msg.sender], "Already registered");
        registered[msg.sender] = true;
        totalRegistered++;
        emit VoterRegistered(msg.sender);
    }

    function vote(uint256 proposalIndex) external inPhase(Phase.Voting) onlyRegistered {
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalIndex < proposals.length, "Invalid proposal");
        hasVoted[msg.sender] = true;
        votes[proposalIndex]++;
        totalVotes++;
        emit VoteCast(msg.sender, proposalIndex);
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposal(uint256 index) external view returns (string memory) {
        require(index < proposals.length, "Invalid index");
        return proposals[index];
    }

    function getVotesFor(uint256 index) external view returns (uint256) {
        require(index < proposals.length, "Invalid index");
        return votes[index];
    }

    function isRegistered(address addr) external view returns (bool) {
        return registered[addr];
    }

    function didVote(address addr) external view returns (bool) {
        return hasVoted[addr];
    }

    function winningProposal() external view inPhase(Phase.Ended) returns (uint256 winnerIndex, uint256 winnerVotes) {
        require(proposals.length > 0, "No proposals");
        uint256 bestVotes = 0;
        uint256 bestIndex = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (votes[i] > bestVotes) {
                bestVotes = votes[i];
                bestIndex = i;
            }
        }
        return (bestIndex, bestVotes);
    }
}
