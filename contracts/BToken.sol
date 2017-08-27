pragma solidity ^0.4.4;

contract Owned {
    address public owner;

    function Owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

contract BToken is Owned {

    /* This creates an array with all balances */
    mapping (address => uint256) public balanceOf; 
    mapping (address => bool) public frozenAccount;

    uint256 public totalSupply;
    string public name;
    string public symbol;
    

    event Transfer(address indexed from, address indexed to, uint256 value);
    event FrozenFunds(address target, bool frozen);
    event Burn(address indexed from, uint256 amount);

    function BToken(uint256 initialSupply, string tokenName, string tokenSymbol) payable {
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        name = tokenName;
        symbol = tokenSymbol;
    }

    function transfer(address _to, uint256 _amount) {
        _transfer(msg.sender, _to, _amount);
    }

    /* Internal transfer, only can be called by this contract */
    function _transfer(address _from, address _to, uint _value) internal {
        require (_to != 0x0);                               // Prevent transfer to 0x0 address. Use burn() instead
        require (balanceOf[_from] > _value);                // Check if the sender has enough
        require (balanceOf[_to] + _value > balanceOf[_to]); // Check for overflows
        require(!frozenAccount[_from]);                     // Check if sender is frozen
        require(!frozenAccount[_to]);                       // Check if recipient is frozen
        balanceOf[_from] -= _value;                         // Subtract from the sender
        balanceOf[_to] += _value;                           // Add the same to the recipient
        Transfer(_from, _to, _value);
    }

    function mintToken(address target, uint256 mintedAmount) onlyOwner {
        balanceOf[target] += mintedAmount;
        totalSupply += mintedAmount;
        Transfer(0, owner, mintedAmount);
        Transfer(owner, target, mintedAmount);
    }

    function freezeAccount(address target, bool freeze) onlyOwner {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

    function burn(uint256 _amount) onlyOwner returns (bool success) {
        require(balanceOf[msg.sender] > _amount);
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        Burn(msg.sender, _amount);
        return true;
    }
}
