const TruffleAssert = require("truffle-assertions");
const web3 = require("web3");

const FaucetContract = artifacts.require("Faucet");

contract('Faucet - [owner]', async (accounts) => {
  let FaucetInstance;
  let OwnerAddress = accounts[0];
  let NewOwnerAddress = accounts[1];

  let newDailyLimit = web3.utils.toBN(2e16);
  const limit = web3.utils.toBN(3e16);

  beforeEach(async () => {
    FaucetInstance = await FaucetContract.new();
    await FaucetInstance.init(limit);
  })

  it("should update new owner", async () => {
    TruffleAssert.passes(await FaucetInstance.updateOwner(NewOwnerAddress, { from: OwnerAddress }));
    let owner = await FaucetInstance.owner();
    assert.equal(owner, NewOwnerAddress)
  })

  it("should revert if non owner updates owner", async () => {
    TruffleAssert.reverts(FaucetInstance.updateOwner(NewOwnerAddress, { from: accounts[2] }), "Ownable: caller is not the owner");
  })

  it("should update daily limit", async () => {
    TruffleAssert.passes(await FaucetInstance.updateDailyLimit(newDailyLimit, { from: OwnerAddress }));
    let limit = await FaucetInstance.dailyLimit();
    assert.equal(limit.toString(), newDailyLimit.toString())
  })

  it("should revert if non owner updates daily limit", async () => {
    TruffleAssert.reverts(FaucetInstance.updateDailyLimit(newDailyLimit, { from: accounts[2] }), "Ownable: caller is not the owner");
  })

  it("should send LA to Faucet contract", async () => {
    TruffleAssert.passes(await FaucetInstance.send(10, { from: OwnerAddress }));
  })

  it("only owner could send ether to Faucet contract", async () => {
    TruffleAssert.reverts(FaucetInstance.send(10, { from: accounts[2] }), "Ownable: caller is not the owner")
  })

  it("should emit Recieved when recieved LA", async () => {
    let tx = await FaucetInstance.send(10, { from: OwnerAddress });
    TruffleAssert.eventEmitted(tx, "Received", ev => {
      return ev.sender == OwnerAddress &&
        ev.amount == 10
    })
  })
})