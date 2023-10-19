const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x2C2307bb8824a0AbBf2CC7D76d8e63374D2f8446")
    challenge = await ethers.getContractAt("Telephone", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("TelephoneAttacker")
    attacker = await attackerFactory.deploy(challenge.address, s1.address)
})

it("solves the challenge", async function () {
    tx = await attacker.attack()
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
