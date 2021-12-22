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

module.exports = {
  accounts: accounts,
  contract: contract,
  chai: chai,
  expect: expect,
  BN: BN,           
  constants: constants,    
  expectEvent: expectEvent,  
  expectRevert: expectRevert
}