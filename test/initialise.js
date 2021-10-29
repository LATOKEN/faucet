const TruffleAssert = require("truffle-assertions");
const web3 = require("web3");

const FaucetContract = artifacts.require("Faucet");

contract('Faucet - [initialise]', async (accounts) => {
  let FaucetInstance;
  let ExpectedOwnerAddress = accounts[0];

  beforeEach(async () => {
    FaucetInstance = await FaucetContract.new();
  })

  it("[sanity] should be initialised", async () => {
    TruffleAssert.passes(await FaucetInstance.init());
  })

  it("should not be initialised twice", async () => {
    TruffleAssert.passes(await FaucetInstance.init());
    TruffleAssert.reverts(FaucetInstance.init(), "Already initialised!");
  })

  it("should be initialised with expected owner", async () => {
    await FaucetInstance.init();
    let owner = await FaucetInstance.owner();
    assert.strictEqual(owner, ExpectedOwnerAddress);
  })

})