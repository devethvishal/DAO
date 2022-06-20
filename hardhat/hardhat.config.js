require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const ALCHEMY_API = process.env.ALCHEMY_API;
const PRIVATE_KEY = process.env.PRIVATE_KEY;



module.exports = {
  solidity: "0.8.4",
  networks: {
    "rinkeby": {
      url: ALCHEMY_API,
      accounts: [PRIVATE_KEY]
    }
  }
};
