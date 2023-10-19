// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMagicNum {
    function setSolver(address _solver) external;
}

contract MagicNumAttacker {
    IMagicNum public challenge;

    constructor(address challengeAddress) {
        challenge = IMagicNum(challengeAddress);
    }

    function attack() public {
        //bytecode explanation: https://coinsbench.com/18-magic-number-ethernaut-explained-3790f6160947
        //Opcodes: https://www.evm.codes/?fork=shanghai
        //bytecode decoder: https://etherscan.io/opcode-tool
        
        // we don't need to send any ETH along and we don't need a salt here
        uint value = 0; 
        bytes32 salt = 0;
        
        //bytecode is stored in memory - before the bytecode, the length of the bytecode is stored in a 32 byte field => 
        //so, there is an offset of 0x20 or 32 bytes

        //init code: 600a 600c 6000 39 600a 6000 f3 => copy runtime code from stack to memory (CODECOPY : 39) =>
        //return the runtime code (10 bytes at pos 00)

        //runtime code: 602a 6000 52 6020 6000 f3 => store the value (42) in memory (MSTORE) and then return it (RETURN : f3)
        bytes memory bytecode = hex"600a600c600039600a6000f3602a60005260206000f3";                                    
        
        address solver;

        //create the contract using the bytecode above => returns contract address
        assembly {
            //create2 : value, offset, size, salt => returns the address of the newly deployed contract

            //add(bytecode, 0x20) This is the location in memory where the contract bytecode starts. 
            //The add opcode adds the two values together to get the starting memory location of the bytecode. 
            //The 0x20 offset is used to skip over the first 32 bytes of the bytecode, which contain the length of the bytecode =>
            //all memory arrays have this offset => in the first 32 bytes, the length of the data is stored and then the data itself
            //in as many 32 byte words as necessary

            //mload(bytecode) : loads the 32 byte value contained at the address bytecode => this is the size of the bytecode
            //with the information provided by arg 2 and arg3, the EVM knows where the bytecode starts in memory and where it ends
            solver := create2(value, add(bytecode, 0x20), mload(bytecode), salt)
        }

        challenge.setSolver(solver);
    }
}