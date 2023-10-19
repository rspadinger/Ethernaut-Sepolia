const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x676e57FdBbd8e5fE1A7A3f4Bb1296dAC880aa639")
    challenge = await ethers.getContractAt("Fallout", challengeAddress)
})

it("solves the challenge", async function () {
    tx = await challenge.Fal1out()
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
