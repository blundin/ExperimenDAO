const { BN } = require("@openzeppelin/test-helpers/src/setup");

const daoToken = artifacts.require('ExperimenDAOToken');
const investmentPool = artifacts.require('InvestmentPool');

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  var token, pool;

  await deployer.deploy(daoToken, initialSupply)
    .then(async function(instance) {
      token = instance;
      return await deployer.deploy(investmentPool, daoToken.address);
    })
    .then(async function(instance) {
      pool = instance;
      const whitelistRole = await token.WHITELISTED();
      
      await token.setInvestmentPool(investmentPool.address);
      await token.grantRole(whitelistRole, investmentPool.address);
      await token.transferOwnership(investmentPool.address);

      const decimals = 18;
      const transferAmount = (initialSupply * (10 ** decimals)).toString();
      console.log(transferAmount);
      const transferBig = new BN(transferAmount);
      console.log(transferBig.toString());

      await token.transfer(investmentPool.address, transferBig);
    });
};