// SPDX-License-Identifier: MIT

const { accounts, contract } = require('@openzeppelin/test-environment');
const chai = require('chai');
const expect = chai.expect;
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const ExperimenDAOToken = contract.fromArtifact('ExperimenDAOToken');
const InvestmentPool = contract.fromArtifact('InvestmentPool');

describe('InvestmentPool', function() {
  const [ owner, founder, toBeFounder, whitelisted1, whitelisted2, notlisted1, notlisted2 ] = accounts;
  const startingBalances = new BN('1000000000000000000000');
  var whitelistRole;
  var token, pool;

  before(async function() {
    // console.log("----------- InvestmentPool Test Run Details -----------");
    // console.log(`Owner: ${owner}`);
    // console.log(`Founder: ${founder}`);
    // console.log(`To Be Founder: ${toBeFounder}`);
    // console.log(`Whitelisted 1: ${whitelisted1}`);
    // console.log(`Not Listed 1: ${notlisted1}`);
  });

  beforeEach(async function() {  
    token = await ExperimenDAOToken.new(1000000, { from: owner });
    pool = await InvestmentPool.new(token.address, { from: owner });
    whitelistRole = await token.WHITELISTED();
    adminRole = await pool.ADMIN();

    await token.grantRole(whitelistRole, whitelisted1, { from: owner });
    await token.grantRole(whitelistRole, whitelisted2, { from: owner });
  });

  describe('Contract creation', function() {
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
    });

    describe('FOUNDER', function() {
      beforeEach(async function() {});
      
      it('sets up new account as a founder', async function() {
        // console.log(`toBeFounder: ${toBeFounder}`);
        // console.log(`owner: ${owner}`);
        await pool.addFounder(toBeFounder, { from: owner });
        expect(await pool.isFounder(toBeFounder)).to.be.true;
      });
    });
  });
});
