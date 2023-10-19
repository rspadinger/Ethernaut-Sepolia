const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, challenge, attacker, tx

before(async () => {
    ;[s1] = await ethers.getSigners()
    const challengeAddress = await createChallenge("0xb5858B8EDE0030e46C0Ac1aaAedea8Fb71EF423C")
    challenge = await ethers.getContractAt("GatekeeperOne", challengeAddress)

    const attackerFactory = await ethers.getContractFactory("GatekeeperOneAttacker")
    attacker = await attackerFactory.deploy(challenge.address)
})

it("solves the challenge", async function () {
    const txOrigin = await s1.address
    const uint16TxOrigin = txOrigin.slice(-4) //take the last 2 bytes => uint16 = 2 bytes

    //solving gateThree: our key is 8 bytes == 16 char => eg: 1122334455667788
    //uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)) => 55667788 == 00007788 => 5566 == 0000
    //uint32(uint64(_gateKey)) != uint64(_gateKey) => 0000000000007788 != 1122334400007788 => the first 4 bytes cannot be 00000000 => eg: 11100000
    //uint32(uint64(_gateKey)) == uint16(uint160(tx.origin) => 00007788 == 0000 + 2B from address => 7788 == 2B from address
    const gateKey = `0x111000000000${uint16TxOrigin}`

    const startGas = 3 * 8191 //if we don't have enough gas, just try with 4 * , 5 * ...

    for (let i = 0; i < 8191; i++) {
        console.log(`Try with gasLimit: ${startGas + i}`)
        try {
            //tx = await attacker.testEnter(gateKey, { gasLimit: startGas + i })
            tx = await attacker.attack(gateKey, startGas + i)
            break
        } catch (err) {
            //console.log("ERROR: ", err)
        }
    }
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
