// SPDX-License-Identifier: MIT

const {
  accounts,
  contract,
  chai,
  expect,
  BN,           
  constants,    
  expectEvent,  
  expectRevert
} = require('../setup/testEnvironment.js');

const ExperimenDAOToken = contract.fromArtifact('ExperimenDAOToken');
const InvestmentPool = contract.fromArtifact('InvestmentPool');

describe('InvestmentPool', async function() {
  const [ owner, 
    founder, 
    toBeFounder, 
    whitelisted1, 
    whitelisted2, 
    notlisted1, 
    notlisted2, 
    admin ] = accounts;
  const startingBalances = new BN('1000000000000000000000');
  var whitelistRole;
  var token, pool;

  before(async function() {
    // console.log("----------- InvestmentPool Test Run Details -----------");
    // console.log(`Owner: ${owner}`);
    // console.log(`Founder: ${founder}`);
    // console.log(`Admin: ${admin}`);
    // console.log(`To Be Founder: ${toBeFounder}`);
    // console.log(`Whitelisted 1: ${whitelisted1}`);
    // console.log(`Not Listed 1: ${notlisted1}`);
    // console.log("\n\n");
  });

  beforeEach(async function() {  
    token = await ExperimenDAOToken.new(1000000, { from: owner });
    pool = await InvestmentPool.new(token.address, { from: owner });
    whitelistRole = await token.WHITELISTED();
    adminRole = await pool.ADMIN();

    // Setup testing accounts
    await token.grantRole(whitelistRole, whitelisted1, { from: owner });
    await token.grantRole(whitelistRole, admin, { from: owner });
    await pool.grantRole(adminRole, admin, { from: owner });

    // Mimic deploy script
    // console.log(`Pool contract address: ${pool.address}`);
    // console.log(`Token contract address: ${token.address}`);
    await token.setInvestmentPool(pool.address, { from: owner });
    await token.transferOwnership(pool.address, { from: owner });
    // await token.grantRole(whitelistRole, pool), { from: pool };
  });

  describe('Contract creation', async function() {
    it('the deployer is the owner', async function() {
      expect(await pool.owner()).to.equal(owner);
    });

    it('the owner is an ADMIN', async function() {
      const poolOwner = await pool.owner();
      // console.log(`poolOwner should be ${owner}. It is actually ${poolOwner}`);
      // console.log(await pool.isAdmin(poolOwner));
      expect(await pool.isAdmin(poolOwner)).to.be.true;
      expect(await pool.hasRole(adminRole, poolOwner)).to.be.true;
    });
  });

  describe('Roles', async function() {
    describe('ADMIN', async function() {
      beforeEach(async function() {});

      it('grants an account the ADMIN role', async function() {
        await pool.addAdmin(notlisted1, { from: owner });
        expect(await pool.hasRole(adminRole, notlisted1, { from: owner })).to.be.true;
      });
      
      it('denies access to non-Owners to add a new ADMIN', async function() {
        await expectRevert(
          pool.addAdmin(notlisted1, { from: notlisted2 }),
          "Ownable: caller is not the owner"
        );
      });

      it('renounces an account\'s ADMIN role', async function() {
        await pool.renounceAdmin({ from: admin });
        expect(await pool.hasRole(adminRole, admin, { from: owner })).to.be.false;
      });
    });

    describe('FOUNDER', async function() {
      beforeEach(async function() {});
      
      it('sets up new account as a founder', async function() {
        await pool.addFounder(toBeFounder, { from: admin });
        expect(await pool.isFounder(toBeFounder)).to.be.true;
      });

      it('denies access to non-admins to add a new FOUNDER', async function() {
        await expectRevert(
          pool.addFounder(notlisted1, { from: notlisted2 }),
          "Restricted to admins."
        );
      });
    });
  });
});
