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

  describe("Contract creation", async function () {
    it("the deployer is the owner", async function () {
      expect(await coordinator.owner()).to.equal(owner);
    });

    it('has the correct investment pool', async function() {
      expect(await coordinator.investmentPool()).to.equal(pool.address);
    });

    it("has the correct token", async function () {
      expect(await coordinator.daoToken()).to.equal(token.address);
    });

    it('has the correct EXD token balance', async function() {
      expect(await token.balanceOf(coordinator.address)).to.be.bignumber.equal(await token.totalSupply());
    });
  });

  describe('After initialization', async function() {
    beforeEach(async function() {
      await coordinator.initializeContracts();
    });

    describe("Contract Initializations", async function () {
      // TODO
      // 1. Verify that DAOCoordinator owns the contracts it should
      // 2. Verify that the token is initialized correctly
      // 3. Verify that the investment pool is initialized correctly
    });

    describe("DAO token management", async function () {
      // TODO
    });

    describe("Investment pool management", async function () {
      // TODO
      // 1. Get the current investment pool contract address
      // 2. Migrate from existing pool to a new one
    });
  });
});