const TruffleAssert = require("truffle-assertions");
const Web3 = require("web3");

const FaucetContract = artifacts.require("Faucet");
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

advanceTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time],
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err); }
      return resolve(result);
    });
  });
}

contract('Faucet - [request]', async (accounts) => {
  let FaucetInstance;
  let OwnerAddress = accounts[0];
  let RecipientAddress = accounts[1];

  const limit = web3.utils.toBN(3e16);

  beforeEach(async () => {
    FaucetInstance = await FaucetContract.new();
    await FaucetInstance.init(limit);
    await FaucetInstance.send(5e16, { from: OwnerAddress })
  })

  it("should send test LA", async () => {
    let balanceBefore = web3.utils.toBN(await web3.eth.getBalance(RecipientAddress));
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    let balanceAfter = web3.utils.toBN(await web3.eth.getBalance(RecipientAddress));
    assert.equal(balanceAfter.toString(), balanceBefore.add(web3.utils.toBN(1e16)).toString())
  })

  it("should revert if daily limit is exceeded", async () => {
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    await advanceTime(300);
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    await advanceTime(300);
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    await advanceTime(300);
    TruffleAssert.reverts(FaucetInstance.request(RecipientAddress), "Daily Limit Exceeded!")
  })

  it("should revert if minimum threshold time is not crossed", async () => {
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    TruffleAssert.reverts(FaucetInstance.request(RecipientAddress), "Minimum threshold time not crossed!")
  })

  it("should update amountWithdrawn", async () => {
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    let amountWithdrawn = await FaucetInstance.amountWithdrawn(RecipientAddress);
    assert.equal(amountWithdrawn.toString(), web3.utils.toBN(1e16).toString())

    await advanceTime(300);

    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    let amountWithdrawn2 = await FaucetInstance.amountWithdrawn(RecipientAddress);
    assert.equal(amountWithdrawn2.toString(), web3.utils.toBN(1e16).mul(web3.utils.toBN(2)).toString())
  })

  it("should update lastWithdrawnToday", async () => {
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    let lastWithdrawnToday = await FaucetInstance.lastWithdrawnToday(RecipientAddress);
    assert.isTrue(lastWithdrawnToday > 0);
  })

  it("should update lastWithdrawnAt only once in a day", async () => {
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    let lastWithdrawnAt = await FaucetInstance.lastWithdrawnAt(RecipientAddress);
    await advanceTime(300);
    TruffleAssert.passes(await FaucetInstance.request(RecipientAddress))
    let lastWithdrawnAt2 = await FaucetInstance.lastWithdrawnAt(RecipientAddress);
    assert.isTrue(lastWithdrawnAt.toString() == lastWithdrawnAt2.toString());
  })

  it("should emit Transferred", async () => {
    let tx = await FaucetInstance.request(RecipientAddress)
    TruffleAssert.eventEmitted(tx, "Transferred", ev => {
      return ev.user == RecipientAddress &&
        ev.amount == 1e16
    })
  })

  it("should revert when funds are not sufficient", async () => {
    TruffleAssert.passes(await FaucetInstance.adminWithdrawFunds(accounts[1], web3.utils.toBN(5e16)))
    TruffleAssert.reverts(FaucetInstance.request(RecipientAddress), "Insuficient funds!")
  })
})