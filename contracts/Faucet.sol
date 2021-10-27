pragma solidity 0.6.4;

import "./SafeMath.sol";

contract Faucet {
    using SafeMath for uint256;
    uint256 public dailyLimit;
    address public owner;
    //mapping for amount withdrawn and timestamp of withdrawal
    mapping(address => uint256) public amountWithdrawn;
    mapping(address => uint256) public lastWithdrawnAt;
    bool private initialised = false;

    event Received(address sender, uint256 amount);
    event Transferred(address user, uint256 amount);

    function init(uint256 _limit) external {
        require(!initialised, "Already initialised!");
        dailyLimit = _limit;
        owner = msg.sender;
        initialised = true;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function getAmountWithdrawn(address _user)
        external
        view
        returns (uint256 amount)
    {
        if (amountWithdrawn[_user] == 0) return 0;
        amount = amountWithdrawn[_user];
    }

    function getLastWithdrawnAt(address _user)
        external
        view
        returns (uint256 time)
    {
        if (lastWithdrawnAt[_user] == 0) return 0;
        time = lastWithdrawnAt[_user];
    }

    function updateOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function updateDailyLimit(uint256 _dailyLimit) external onlyOwner {
        dailyLimit = _dailyLimit;
    }

    receive() external payable {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        emit Received(msg.sender, msg.value);
    }

    function adminWithdrawFunds(address payable user, uint256 amount)
        external
        payable
        onlyOwner
    {
        require(address(this).balance >= amount, "Insuficient funds!");
        user.transfer(amount);
        emit Transferred(user, amount);
    }

    function request(address payable user) external payable onlyOwner {
        uint256 amount = 1e16;
        require(address(this).balance >= amount, "Insuficient funds!");

        if (now.sub(lastWithdrawnAt[user]) <= 86400) {
            require(
                amountWithdrawn[user].add(amount) <= dailyLimit,
                "Daily Limit Exceeded!"
            );
            require(
                now.sub(lastWithdrawnAt[user]) >= 300,
                "Minimum threshold time not crossed!"
            );
        } else {
            amountWithdrawn[user] = 0;
            lastWithdrawnAt[user] = now;
        }
        user.transfer(amount);
        amountWithdrawn[user] = amountWithdrawn[user].add(amount);
        emit Transferred(user, amount);
    }
}
