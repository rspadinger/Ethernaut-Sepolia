const { Contract, Signer } = require("ethers")

const ETHERNAUT_ADDRESS = `0xa3e7317E591D5A0F1c605be1b3aC4D2ae56104d6`

// manually copied from the website while inspect the web console : JSON.stringify(ethernaut.abi)
const ETHERNAUT_ABI = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "player", type: "address" },
            { indexed: true, internalType: "address", name: "instance", type: "address" },
            { indexed: true, internalType: "address", name: "level", type: "address" },
        ],
        name: "LevelCompletedLog",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "player", type: "address" },
            { indexed: true, internalType: "address", name: "instance", type: "address" },
            { indexed: true, internalType: "address", name: "level", type: "address" },
        ],
        name: "LevelInstanceCreatedLog",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
            { indexed: true, internalType: "address", name: "newOwner", type: "address" },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        inputs: [{ internalType: "contract Level", name: "_level", type: "address" }],
        name: "createLevelInstance",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "emittedInstances",
        outputs: [
            { internalType: "address", name: "player", type: "address" },
            { internalType: "contract Level", name: "level", type: "address" },
            { internalType: "bool", name: "completed", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "contract Level", name: "_level", type: "address" }],
        name: "registerLevel",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "registeredLevels",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "_statProxy", type: "address" }],
        name: "setStatistics",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "statistics",
        outputs: [{ internalType: "contract IStatistics", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address payable", name: "_instance", type: "address" }],
        name: "submitLevelInstance",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
]

const submitLevel = async (address) => {
    try {
        const ethernaut = await ethers.getContractAt(ETHERNAUT_ABI, ETHERNAUT_ADDRESS)
        let tx = await ethernaut.submitLevelInstance(address)
        await tx.wait()

        const txReceipt = await ethernaut.provider.getTransactionReceipt(tx.hash)
        if (txReceipt.logs.length === 0) return false

        //console.log(txReceipt.logs[0])

        const event = ethernaut.interface.parseLog(txReceipt.logs[0])

        return event.name === `LevelCompletedLog`
    } catch (error) {
        console.error(`submitLevel: ${error.message}`)
        return false
    }
}

const createChallenge = async (contractLevel, value = 0) => {
    try {
        const ethernaut = await ethers.getContractAt(ETHERNAUT_ABI, ETHERNAUT_ADDRESS)

        let tx = await ethernaut.createLevelInstance(contractLevel, { value })
        await tx.wait()

        const txReceipt = await ethernaut.provider.getTransactionReceipt(tx.hash)

        if (txReceipt.logs.length === 0) throw new Error(`No event found`)
        const events = txReceipt.logs
            .map((log) => {
                try {
                    return ethernaut.interface.parseLog(log)
                } catch {
                    return undefined
                }
            })
            .filter(Boolean)

        const event = events.find(
            (event) => event.name === `LevelInstanceCreatedLog` && event.args.instance
        )
        if (!event) throw new Error(`Invalid Event ${JSON.stringify(event)}`)

        return event.args.instance
    } catch (error) {
        console.error(`createChallenge: ${error.message}`)
        throw new Error(`createChallenge failed: ${error.message}`)
    }
}

module.exports = { ETHERNAUT_ADDRESS, submitLevel, createChallenge }
