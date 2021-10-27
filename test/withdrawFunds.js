const TruffleAssert = require("truffle-assertions");
const web3 = require("web3");

const FaucetContract = artifacts.require("Faucet");

contract('Faucet - [withdrew funds]', async (accounts) => {
  let FaucetInstance;
  let OwnerAddress = accounts[0];

  const limit = web3.utils.toBN(3e16);

  beforeEach(async () => {
    FaucetInstance = await FaucetContract.new();
    await FaucetInstance.init(limit);
    await FaucetInstance.send(10, { from: OwnerAddress })
  })

  it("should be able to withdraw funds", async () => {
    // let balanceBefore = await web3.eth.getBalance(accounts[1]);
    TruffleAssert.passes(await FaucetInstance.adminWithdrawFunds(accounts[1], 10));
    // let balanceAfter = await web3.eth.getBalance(accounts[1]);
    // assert.equal(balanceAfter.toString(), balanceBefore.add(10).toString())
  })

  it("non admin should not withdraw funds", async () => {
    TruffleAssert.reverts(FaucetInstance.adminWithdrawFunds(accounts[1], 10, { from: accounts[1] }), "Ownable: caller is not the owner");
  })

  it("reverts if amount is greater than balance of contract", async () => {
    TruffleAssert.reverts(FaucetInstance.adminWithdrawFunds(accounts[1], 100), "Insuficient funds!");
  })

  it("should emit Transferred when withdraw funds", async () => {
    let tx = await FaucetInstance.adminWithdrawFunds(accounts[1], 10)
    TruffleAssert.eventEmitted(tx, "Transferred", ev => {
      return ev.user == accounts[1] &&
        ev.amount == 10
    })
  })
})