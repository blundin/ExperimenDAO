// SPDX-License-Identifier: MIT

const {
  accounts,
  contract,
  chai,
  expect,
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("../setup/testEnvironment.js");

const DAOCoordinator = contract.fromArtifact("DAOCoordinator");
const ExperimenDAOToken = contract.fromArtifact("ExperimenDAOToken");
const InvestmentPool = contract.fromArtifact("InvestmentPool");

describe('DAOCoordinator', async function() {
  const [
    owner, 
    whitelisted1, 
    whitelisted2, 
    notlisted1, 
    notlisted2, 
    fakePool,
    poolAdmin
  ] = accounts;

  var coordinator, token, pool;

  beforeEach(async function() {
    const initalTokenSupply = new BN("1000000000000000000000");

    token = await ExperimenDAOToken.new(1000000, { from: owner });
    pool = await InvestmentPool.new({ from: owner });
    coordinator = await DAOCoordinator.new(token.address, pool.address, { from: owner });

    await token.transferOwnership(coordinator.address, { from: owner });
    await pool.transferOwnership(coordinator.address, { from: owner });
  });

  describe("Contract creation", async function() {
    it("the deployer is the owner", async function() {
      expect(await coordinator.owner()).to.equal(owner);
    });

    it('has the correct investment pool', async function() {
      expect(await coordinator.investmentPool()).to.equal(pool.address);
    });

    it("has the correct token", async function() {
      expect(await coordinator.daoToken()).to.equal(token.address);
    });

    it('has the correct EXD token balance', async function() {
      expect(await token.balanceOf(coordinator.address)).to.be.bignumber.equal(await token.totalSupply());
    });
  });

  describe('After initialization', async function() {
    beforeEach(async function() {
      await coordinator.initializeContracts({ from: owner });
    });

    describe("Contract Initializations", async function() {
      it('owns the correct contracts', async function() {
        const tokenAddress = await coordinator.daoToken();
        expect(tokenAddress).to.equal(token.address);
      });

      it('properly initialized the token contract', async function() {
        // Add additional tests here as the initialization function grows
        expect(await token.initialized()).to.be.true;
      });

      it('properly initialized the investment pool contract', async function () {
        expect(await pool.initialized()).to.be.true;
        expect(await pool.daoToken()).to.equal(token.address);
      });
    });

    describe('DAO token management', async function() {
      // TODO
    });

    describe('Investment pool management', async function() {
      let newPool, tokenWhitelistedRole, tokenDefaultAdminRole;
      
      beforeEach(async function() {
        tokenWhitelistedRole = await token.WHITELISTED();
        tokenDefaultAdminRole = await token.DEFAULT_ADMIN_ROLE();

        newPool = await InvestmentPool.new({ from: owner });
        newPool.transferOwnership(coordinator.address, { from: owner });
      });

      describe('Migration', async function() {
        it('returns the new investment pool contract address', async function() {
          await coordinator.migrateInvestmentPool(newPool.address, { from: owner });

          const actualPool = await coordinator.investmentPool();
          expect(actualPool).to.equal(newPool.address);
          expect(actualPool).to.not.equal(pool.address);
        });

        it("gave the investment pool the DEFAULT_ADMIN_ROLE role for ExperimenDAO token", async function () {
          await coordinator.migrateInvestmentPool(newPool.address, { from: owner });

          expect(await token.hasRole(tokenDefaultAdminRole, newPool.address, { from: owner })).to.be.true;
        });

        it('gave the investment pool the WHITELISTED role for ExperimenDAO token', async function() {
          await coordinator.migrateInvestmentPool(newPool.address, { from: owner });

          expect(await token.hasRole(tokenWhitelistedRole, newPool.address, { from: owner })).to.be.true;
        });
      });
    });
  });
});