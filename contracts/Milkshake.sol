pragma solidity ^0.5.0;

/**
 * Target smart contract.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */
contract Milkshake 
{
    mapping (address => uint) public _balances;

    constructor() public payable
    {
        put();
    }

    function put() public payable 
    {
        _balances[msg.sender] = msg.value;
    }

    function get() public payable
    {
        bool success;
        bytes memory data;
        (success, data) = msg.sender.call.value(_balances[msg.sender])("");

        if (!success) 
        {
            revert("withdrawal failed");
        }

        _balances[msg.sender] = 0;
    }

    function() external payable
    {
        revert();
    }
}
