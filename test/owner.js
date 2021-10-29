const TruffleAssert = require("truffle-assertions");
const web3 = require("web3");

const FaucetContract = artifacts.require("Faucet");

contract('Faucet - [owner]', async (accounts) => {
  let FaucetInstance;
  let OwnerAddress = accounts[0];
  let NewOwnerAddress = accounts[1];

  let newDailyLimit = web3.utils.toBN(2e16);
  let newAmountPerRequest = web3.utils.toBN(3e16);
  let newMinThresholdTime = 500;

  beforeEach(async () => {
    FaucetInstance = await FaucetContract.new();
    await FaucetInstance.init();
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

  it("should update amount per request", async()=>{
    TruffleAssert.passes(await FaucetInstance.updateAmountPerRequest(newAmountPerRequest, { from: OwnerAddress }));
    let amountPerRequest = await FaucetInstance.amountPerRequest();
    assert.equal(amountPerRequest.toString(), newAmountPerRequest.toString())
  })

  it("should revert if non owner updates amount per request", async () => {
    TruffleAssert.reverts(FaucetInstance.updateAmountPerRequest(newAmountPerRequest, { from: accounts[2] }), "Ownable: caller is not the owner");
  })

  it("should update minimum threshold time", async()=>{
    TruffleAssert.passes(await FaucetInstance.updateMinThresholdTime(newMinThresholdTime, { from: OwnerAddress }));
    let updateMinThresholdTime = await FaucetInstance.updateMinThresholdTime();
    assert.equal(updateMinThresholdTime.toString(), newMinThresholdTime.toString())
  })

  it("should revert if non owner updates minimum threshold time", async () => {
    TruffleAssert.reverts(FaucetInstance.updateMinThresholdTime(newMinThresholdTime, { from: accounts[2] }), "Ownable: caller is not the owner");
  })
})