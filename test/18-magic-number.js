const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x2132C7bc11De7A90B87375f282d36100a29f97a9")
    challenge = await ethers.getContractAt("MagicNum", challengeAddress)
    const attackerFactory = await ethers.getContractFactory("MagicNumAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    tx = await attacker.attack()
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
