const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge(
        "0x2427aF06f748A6adb651aCaB0cA8FbC7EaF802e6",
        ethers.utils.parseEther("1")
    )
    challenge = await ethers.getContractAt("Denial", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("DenialAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    tx = await attacker.attack()
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
