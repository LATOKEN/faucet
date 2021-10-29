// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./utils/SafeMath.sol";

contract ExampleToken {
    using SafeMath for uint256;

    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    address public _owner;
    address public _minter;

    bool private _initialised = false;

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Transfer(address indexed from, address indexed to, uint256 value);

    function init(string memory name_, string memory symbol_) public {
        require(!_initialised, "Token: Already Initialised!");
        _owner = msg.sender;
        _minter = msg.sender;
        _name = name_;
        _symbol = symbol_;
        _decimals = 18;
        _initialised = true;
    }

    modifier isInitialised() {
        require(_initialised, "Token: not initialised!");
        _;
    }

    function updateMinter(address minter) external {
        require(msg.sender == _owner, "Token: sender not owner");
        _minter = minter;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == _minter, "Token: must have minter role to mint");
        _mint(to, amount);
    }

    function name() public view isInitialised returns (string memory) {
        return _name;
    }

    function symbol() public view isInitialised returns (string memory) {
        return _symbol;
    }

    function decimals() public view isInitialised returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view isInitialised returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account)
        public
        view
        isInitialised
        returns (uint256)
    {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        isInitialised
        returns (bool)
    {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        isInitialised
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        isInitialised
        returns (bool)
    {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public isInitialised returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(
            sender,
            msg.sender,
            _allowances[sender][msg.sender].sub(
                amount,
                "Token: transfer amount exceeds allowance"
            )
        );
        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal isInitialised {
        require(sender != address(0), "Token: transfer from the zero address");
        require(recipient != address(0), "Token: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(
            amount,
            "Token: transfer amount exceeds balance"
        );
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal isInitialised {
        require(account != address(0), "Token: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal isInitialised {
        require(account != address(0), "Token: burn from the zero address");

        _balances[account] = _balances[account].sub(
            amount,
            "Token: burn amount exceeds balance"
        );
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal isInitialised {
        require(owner != address(0), "Token: approve from the zero address");
        require(spender != address(0), "Token: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
