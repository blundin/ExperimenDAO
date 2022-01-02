const { BN } = require("@openzeppelin/test-helpers/src/setup");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const daoToken = artifacts.require('ExperimenDAOToken');
const investmentPool = artifacts.require('InvestmentPool');
const daoCoordinator = artifacts.require('DAOCoordinator');

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  var token, pool, coordinator;

  await deployer.deploy(daoToken, initialSupply)
    .then(async function(tokenInstance) {
      token = tokenInstance;
      return await deployer.deploy(investmentPool);
    })
    .then(async function(poolInstance) {
      pool = poolInstance;
      return await deployer.deploy(daoCoordinator, token, pool);
    })
    .then(async function(coordinatorInstance) {
      coordinator = coordinatorInstance;
    })
    .then(async function() {
      await token.transferOwnership(coordinator.address);
      await pool.transferOwnership(coordinator.address);

      await coordinator.initializeContracts();
    });

  /* ------------ OLD --------------- */
  // await deployer.deploy(daoToken, initialSupply)
  //   .then(async function(tokenInstance) {
  //     token = tokenInstance;
  //     return await deployer.deploy(investmentPool, daoToken.address);
  //   })
  //   .then(async function(poolInstance) {
  //     pool = poolInstance;
  //     const whitelistRole = await token.WHITELISTED();
      
  //     await token.grantRole(whitelistRole, investmentPool.address);
  //     await token.migrateInvestmentPool(investmentPool.address);
  //     await token.transferOwnership(investmentPool.address);

  //     const decimals = 18;
  //     const transferAmount = (initialSupply * (10 ** decimals)).toString();
  //     console.log(transferAmount);
  //     const transferBig = new BN(transferAmount);
  //     console.log(transferBig.toString());

  //     await token.transfer(investmentPool.address, transferBig);
  // });
};