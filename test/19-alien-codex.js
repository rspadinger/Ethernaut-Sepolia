const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()

    //TODO set blockNumber in hardhat.config.js to 3500000
    const challengeAddress = await createChallenge("0x0BC04aa6aaC163A6B3667636D798FA053D43BD11")
    challenge = await ethers.getContractAt("AlienCodex", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("AlienCodexAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    tx = await attacker.attack()
    await tx.wait
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
