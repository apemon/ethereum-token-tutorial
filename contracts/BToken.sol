pragma solidity ^0.4.4;

contract BToken {

    /* This creates an array with all balances */
    mapping (address => uint256) public balanceOf; 
    string public name;
    string public symbol;

    event Transfer(address indexed from, address indexed to, uint256 value);
    
    function BToken(uint256 initialSupply, string tokenName, string tokenSymbol) payable {
        balanceOf[msg.sender] = initialSupply;
        name = tokenName;
        symbol = tokenSymbol;
    }

    function transfer(address _to, uint256 _value) {
        /* Check if sender has balance and for overflows */
        if (balanceOf[msg.sender] < _value || balanceOf[_to] + _value < balanceOf[_to])
            throw;

        /* Add and subtract new balances */
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        /* Notify anyone listening that this transfer took place */
        Transfer(msg.sender, _to, _value);
    } 
}
