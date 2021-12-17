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

describe('ExperimenDAOToken', function() {
  const [ owner, whitelisted1, whitelisted2, notlisted1, notlisted2 ] = accounts;
  const startingBalances = new BN('1000000000000000000000');
  var whitelistRole;
  var token;

    before(async function() {
    // console.log("----------- InvestmentPool Test Run Details -----------");
    // console.log(`Owner: ${owner}`);
    // console.log(`Whitelisted 1: ${whitelisted1}`);
    // console.log(`Not Listed 1: ${notlisted1}`);
  });
  
  beforeEach(async function() {  
    token = await ExperimenDAOToken.new(1000000, { from: owner });
    whitelistRole = await token.WHITELISTED();

    await token.grantRole(whitelistRole, whitelisted1, { from: owner });
    await token.grantRole(whitelistRole, whitelisted2, { from: owner });
  });

  it('the deployer is the owner', async function() {
    expect(await token.owner()).to.equal(owner);
  });

  it('has the right initialSupply', async function() {
    const expectedSupply = new BN('1000000000000000000000000');
    expect(await token.totalSupply()).to.be.bignumber.equal(expectedSupply);
  });

  describe('AccessControl', function() {
    beforeEach(async function() {});

    it('grants the Whitelist role correctly', async function() {
      await token.grantRole(whitelistRole, notlisted1, { from: owner });
      expect(await token.hasRole(whitelistRole, notlisted1, { from: owner })).to.be.true;
    });

    it('revokes the Whitelist role correctly', async function() {
      await token.revokeRole(whitelistRole, whitelisted1, { from: owner });
      expect(await token.hasRole(whitelistRole, whitelisted1, { from: owner })).to.be.false;
    });
  });

  describe('ERC20Pausable', function() {
    beforeEach(async function() {});

    it('pauses correctly', async function() {
      await token.pause({from: owner });
      expect(await token.paused()).to.be.true;
    });

    it('pauses and resumes correctly', async function() {
      await token.pause({from: owner });
      expect(await token.paused()).to.be.true;

      await token.unpause({from: owner });
      expect(await token.paused()).to.be.false;
    });
  });

  describe('Allowances', function() {
    const allowance = new BN('25000000000000000000');
    const noAllowance = new BN('0');

    beforeEach(async function() {
      await token.increaseAllowance(whitelisted2, allowance, { from: owner });
      expect(await token.allowance(owner, whitelisted2)).to.be.bignumber.equal(allowance);
    });

    it('increases the allowance properly', async function() {
      await token.increaseAllowance(whitelisted1, allowance, { from: owner });
      expect(await token.allowance(owner, whitelisted1)).to.be.bignumber.equal(allowance);
    });

    it('decreases the allowance properly', async function() {
      await token.decreaseAllowance(whitelisted2, allowance, { from: owner });
      expect(await token.allowance(owner, whitelisted2)).to.be.bignumber.equal(noAllowance);
    });
  });

  describe('Transfers', function() {
    const transferAmount = new BN('10000000000000000');

    it('allows a transfer to a whitelisted account', async function() {
      await token.transfer(whitelisted1, transferAmount, { from: owner });
      expect(await token.balanceOf(whitelisted1)).to.be.bignumber.equal(transferAmount);
    });

    it('rejects a transfer to a non-whitelisted account', async function() {
      await expectRevert(
        token.transfer(notlisted1, transferAmount, { from: owner }),
        "Invalid recipient"
      );
    });
  });
});