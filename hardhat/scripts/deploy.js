const { NFT_CONTRACT_ADDR } = require("../constants");

const { ethers } = require("hardhat");

async function main() {
    //@dev Depolyment of fakenftMarketPlace contract to get its address which will be further used in the deployment of DAO Contract
    const nftMarketPlaceContract = await ethers.getContractFactory("FakeNFTMarketplace");
    const nftMarketPlaceContractDeployed = await nftMarketPlaceContract.deploy();
    await nftMarketPlaceContractDeployed.deployed();
    const NFTMARKETPLACE_CONTRACT_ADDR = nftMarketPlaceContractDeployed.address;
    console.log("FAKENFTMARKETPLACE contract deployed to the address: " + NFTMARKETPLACE_CONTRACT_ADDR);

    //@dev Deployent of DAO Contract
    const daoContract = await ethers.getContractFactory("CryptoDevsDAO");
    const daoContractDeployed = await daoContract.deploy(NFTMARKETPLACE_CONTRACT_ADDR, NFT_CONTRACT_ADDR, {
        value: ethers.utils.parseEther("0.5")
    });
    await daoContractDeployed.deployed();
    console.log("CryptoDevs DAO Contract deployed successfully to the address : " + daoContractDeployed.address);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
