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
      
      await token.grantRole(whitelistRole, investmentPool.address);
      await token.transferOwnership(investmentPool.address);
    });
};