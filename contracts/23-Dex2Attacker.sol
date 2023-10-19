// SPDX-License-Identifier: MIT
pragma solidity <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BadToken1 is ERC20 {
    constructor() public ERC20("BadToken1", "BT1") {
        _mint(msg.sender, 2 * 10 ** uint(decimals()));
    }
}

contract BadToken2 is ERC20 {
    constructor() public ERC20("BadToken2", "BT2") {
        _mint(msg.sender, 2 * 10 ** uint(decimals()));
    }
}