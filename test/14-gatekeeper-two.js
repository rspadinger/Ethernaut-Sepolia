const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x0C791D1923c738AC8c4ACFD0A60382eE5FF08a23")
    challenge = await ethers.getContractAt("GatekeeperTwo", challengeAddress)
})

it("solves the challenge", async function () {
    // the attack happens during deployment of the GatekeeperTwoAttacker contract
    const attackerFactory = await ethers.getContractFactory("GatekeeperTwoAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
