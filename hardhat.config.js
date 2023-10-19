require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const { ALCHEMY_SEPOLIA } = process.env

module.exports = {
    solidity: {
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
        compilers: [
            { version: "0.5.0" },
            { version: "0.6.0" },
            { version: "0.7.0" },
            { version: "0.8.0" },
            { version: "0.8.4" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: ALCHEMY_SEPOLIA,
                blockNumber: 2500000,
            },
        },
    },
    mocha: {
        timeout: 300 * 1e3,
    },
}
