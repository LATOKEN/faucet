const TruffleAssert = require("truffle-assertions");
const web3 = require("web3");

const FaucetContract = artifacts.require("Faucet");

contract('Faucet - [initialise]', async (accounts) => {
  let FaucetInstance;
  let ExpectedOwnerAddress = accounts[0];
  const limit = web3.utils.toBN(3e16);

  beforeEach(async () => {
    FaucetInstance = await FaucetContract.new();
  })

  it("[sanity] should be initialised", async () => {
    TruffleAssert.passes(await FaucetInstance.init(limit));
  })

  it("should not be initialised twice", async () => {
    TruffleAssert.passes(await FaucetInstance.init(limit));
    TruffleAssert.reverts(FaucetInstance.init(limit), "Already initialised!");
  })

  it("should be initialised with expected owner", async () => {
    await FaucetInstance.init(limit);
    let owner = await FaucetInstance.owner();
    assert.strictEqual(owner, ExpectedOwnerAddress);
  })

  it("should set daily limit through init", async () => {
    await FaucetInstance.init(limit);
    let setLimit = await FaucetInstance.dailyLimit();
    assert.equal(setLimit.toString(), limit.toString());
  })

})