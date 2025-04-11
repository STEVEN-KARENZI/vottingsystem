import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";

// Replace with your actual deployed contract address and ABI
const contractAddress = "0x9396B453Fad71816cA9f152Ae785276a1D578492";
const contractABI = [
  [
    [
      {
        "inputs": [],
        "name": "endVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "startVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string[]",
            "name": "candidateNames",
            "type": "string[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "candidateId",
            "type": "uint256"
          }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "voter",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "candidateId",
            "type": "uint256"
          }
        ],
        "name": "VoteCast",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "VotingEnded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "VotingStarted",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "admin",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "candidates",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "candidatesCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "getCandidate",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getWinner",
        "outputs": [
          {
            "internalType": "string",
            "name": "winnerName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "highestVotes",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "voters",
        "outputs": [
          {
            "internalType": "bool",
            "name": "hasVoted",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "votedCandidateId",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "votingActive",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  ]
];

export default function VotingApp() {
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const voteContract = new Contract(contractAddress, contractABI, signer);

        setContract(voteContract);
        await loadCandidates(voteContract);
      } else {
        alert("Please install MetaMask to use this app.");
      }
    }

    init();
  }, []);

  const loadCandidates = async (contract) => {
    const candidatesList = [];
    let index = 0;
    while (true) {
      try {
        const candidate = await contract.candidates(index);
        candidatesList.push({
          name: candidate.name,
          voteCount: candidate.voteCount.toString(),
          index,
        });
        index++;
      } catch (err) {
        break;
      }
    }
    setCandidates(candidatesList);
  };

  const vote = async (index) => {
    try {
      const tx = await contract.vote(index);
      await tx.wait();
      alert("Vote cast successfully!");
      await loadCandidates(contract);
    } catch (err) {
      alert("Error casting vote: " + err.reason || err.message);
    }
  };

  const getWinner = async () => {
    try {
      const result = await contract.getWinner();
      setWinner(result);
    } catch (err) {
      alert("Failed to get winner: " + err.reason || err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">🗳 Blockchain Voting DApp</h1>

      {candidates.map((candidate) => (
        <div key={candidate.index} className="mb-4 p-4 border rounded-xl shadow-sm">
          <p className="text-lg font-semibold">{candidate.name}</p>
          <p className="text-sm text-gray-600">Votes: {candidate.voteCount}</p>
          <button
            onClick={() => vote(candidate.index)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Vote
          </button>
        </div>
      ))}

      <button
        onClick={getWinner}
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
      >
        Get Winner
      </button>

      {winner && <p className="mt-4 text-lg font-semibold">🏆 Winner: {winner}</p>}
    </div>
  );
}
