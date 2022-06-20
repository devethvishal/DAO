//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketPlace {
    function getPrice() external view returns (uint256);

    function available(uint256 _tokenId) external view returns (bool);

    function purchase(uint256 _tokenId) external payable;
}

interface ICryptoDevs {
    function balanceOf(address _owner) external view returns (uint256);

    function tokenOfOwnerByIndex(address _owner, uint256 _index)
        external
        view
        returns (uint256);
}

contract CryptoDevsDAO is Ownable {
    struct Proposal {
        uint256 nftTokenId;
        uint256 deadline;
        uint256 yayVotes;
        uint256 nayVotes;
        bool executed;
        mapping(uint256 => bool) nftVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public numProposals;

    IFakeNFTMarketPlace nftMarketPlace;
    ICryptoDevs cryptoDevsNFT;

    constructor(address _nftMarketPlace, address _cryptoDevsNFT) payable {
        nftMarketPlace = IFakeNFTMarketPlace(_nftMarketPlace);
        cryptoDevsNFT = ICryptoDevs(_cryptoDevsNFT);
    }

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT A DAO MEMBER");
        _;
    }

    function createProposal(uint256 _nftTokenId)
        external
        nftHolderOnly
        returns (uint256)
    {
        require(nftMarketPlace.available(_nftTokenId), "NFT NOT FOR SALE");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        numProposals++;
        return (numProposals - 1);
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "DEADLINE EXCEEDED"
        );
        _;
    }

    enum Vote {
        YAY,
        NAY
    }

    function voteOnProposal(uint256 proposalIndex, Vote vote)
        external
        nftHolderOnly
        activeProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];
        uint256 balancOfNFT = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 numOfVotes = 0;

        for (uint256 i = 0; i < balancOfNFT; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.nftVoted[tokenId] == false) {
                numOfVotes++;
                proposal.nftVoted[tokenId] = true;
            }
            require(numOfVotes > 0, "Already Voted");

            if (vote == Vote.YAY) {
                proposal.yayVotes++;
            } else {
                proposal.nayVotes++;
            }
        }
    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "DEADLINE NOT EXCEEDED"
        );
        require(
            proposals[proposalIndex].executed == false,
            "PROPOSAL HAS ALREADY BEEN EXECUTED"
        );
        _;
    }

    function executeProposal(uint256 proposalIndex)
        external
        inactiveProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];
        if (proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = nftMarketPlace.getPrice();
            require(address(this).balance >= nftPrice, "NOT ENOUGH FUNDS");
            nftMarketPlace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }
}
