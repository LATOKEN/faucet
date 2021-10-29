pragma solidity 0.6.4;

import "./utils/SafeMath.sol";
import "./utils/IERC20.sol";

contract Faucet {
    using SafeMath for uint256;

    uint256 public dailyLimit = 3e16;
    address public owner;
    uint256 public amountPerRequest = 1e16;
    uint256 public minThresholdTime = 300;
    //mapping for amount withdrawn and timestamp of withdrawal
    mapping(address => uint256) public amountWithdrawn;
    mapping(address => uint256) public lastWithdrawnAt;
    mapping(address => uint256) public lastWithdrawnToday;
    bool private initialised = false;

    event Received(address sender, uint256 amount);
    event Transferred(address user, uint256 amount);

    function init() external {
        require(!initialised, "Already initialised!");
        owner = msg.sender;
        initialised = true;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    modifier isInitialised() {
        require(initialised, "Faucet: not initialised!");
        _;
    }

    function getAmountWithdrawn(address _user)
        external
        view isInitialised
        returns (uint256 amount)
    {
        if (amountWithdrawn[_user] == 0) return 0;
        amount = amountWithdrawn[_user];
    }

    function getLastWithdrawnAt(address _user)
        external
        view isInitialised
        returns (uint256 time)
    {
        if (lastWithdrawnAt[_user] == 0) return 0;
        time = lastWithdrawnAt[_user];
    }

    function updateOwner(address _owner) external onlyOwner isInitialised {
        owner = _owner;
    }

    function updateDailyLimit(uint256 _dailyLimit) external onlyOwner isInitialised {
        dailyLimit = _dailyLimit;
    }

    function updateAmountPerRequest(uint256 _amount) external onlyOwner isInitialised {
        amountPerRequest = _amount;
    }

    function updateMinThresholdTime(uint256 _time) external onlyOwner isInitialised {
        minThresholdTime = _time;
    }

    function request(address user, address tokenAddress) external isInitialised {
        uint256 nowTime = block.timestamp;
        if (nowTime.sub(lastWithdrawnAt[user]) <= 86400) {
            require(
                amountWithdrawn[user].add(amountPerRequest) <= dailyLimit,
                "Daily Limit Exceeded!"
            );
            require(
                nowTime.sub(lastWithdrawnToday[user]) >= minThresholdTime,
                "Minimum threshold time not crossed!"
            );
        } else {
            amountWithdrawn[user] = 0;
            lastWithdrawnAt[user] = nowTime;
        }
        IERC20(tokenAddress).mint(user, amountPerRequest);
        amountWithdrawn[user] = amountWithdrawn[user].add(amountPerRequest);
        lastWithdrawnToday[user] = nowTime;
        emit Transferred(user, amountPerRequest);
    }
}
