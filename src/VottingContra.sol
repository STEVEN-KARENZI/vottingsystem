// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public admin;
    bool public votingActive;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint votedCandidateId;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    uint public candidatesCount;

    event VoteCast(address voter, uint candidateId);
    event VotingStarted();
    event VotingEnded();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    modifier onlyWhileActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor(string[] memory candidateNames) {
        admin = msg.sender;
        for (uint i = 0; i < candidateNames.length; i++) {
            candidates[i] = Candidate(i, candidateNames[i], 0);
        }
        candidatesCount = candidateNames.length;
    }

    function startVoting() public onlyAdmin {
        votingActive = true;
        emit VotingStarted();
    }

    function endVoting() public onlyAdmin {
        votingActive = false;
        emit VotingEnded();
    }

    function vote(uint candidateId) public onlyWhileActive {
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(candidateId < candidatesCount, "Invalid candidate");

        voters[msg.sender] = Voter(true, candidateId);
        candidates[candidateId].voteCount += 1;

        emit VoteCast(msg.sender, candidateId);
    }

    function getCandidate(uint id) public view returns (string memory, uint) {
        require(id < candidatesCount, "Invalid candidate");
        Candidate memory c = candidates[id];
        return (c.name, c.voteCount);
    }

    function getWinner() public view returns (string memory winnerName, uint highestVotes) {
        require(!votingActive, "Voting is still active");

        uint maxVotes = 0;
        uint winnerId;

        for (uint i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        winnerName = candidates[winnerId].name;
        highestVotes = maxVotes;
    }
}
