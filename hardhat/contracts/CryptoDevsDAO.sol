//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketPlace {
    function getPrice() external view returns (uint256);

    function available(uint256 _tokenId) external view returns (bool);

    function purchase(uint256 _tokenId) external payable;
}

interface ICryptoDevs {
    function balanceOf(address _owner) external view returns(uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns(uint256);
}

contract CryptoDevsDAO is Ownable {
    
}
