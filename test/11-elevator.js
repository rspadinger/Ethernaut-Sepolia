const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x6DcE47e94Fa22F8E2d8A7FDf538602B1F86aBFd2")
    challenge = await ethers.getContractAt("Elevator", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("ElevatorAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    tx = await attacker.attack()
    await tx.wait()

    console.log("Current floor: ", await challenge.floor())
    console.log("Are we at the top? ", await challenge.top())
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
