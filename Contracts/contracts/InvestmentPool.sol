// SPDX-License-Identifier: MIT
/// @author Brian Lundin
pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./tokens/ExperimenDAOToken.sol";

/**
  * @title InvestmentPool
  * @notice This contract is the interface for investors and coordinates investment activity.
  */ 
contract InvestmentPool is Ownable, AccessControl {
  bytes32 public constant FOUNDER = keccak256("FOUNDER");
  bytes32 public constant MEMBER = keccak256("MEMBER");
  bytes32 public constant ADMIN = keccak256("ADMIN");

  ExperimenDAOToken private daoToken;
  mapping(address => bool) founders;
  mapping(address => bool) members;

  constructor(ExperimenDAOToken _daoToken) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN, DEFAULT_ADMIN_ROLE);
    _setRoleAdmin(FOUNDER, ADMIN);

    _grantRole(ADMIN, msg.sender);
    
    daoToken = _daoToken;
  }

  // FOUNDER functions
  function addFounder(address newFounder) public onlyAdmin {
    _grantRole(FOUNDER, newFounder);
    founders[newFounder] = true;
    // addMember(newFounder);
  }

  modifier onlyFounder() {
    require(isFounder(msg.sender) && founders[msg.sender], "Restricted to founders." );
    _;
  }

  function isFounder(address account) public view returns (bool) {
    return founders[account] && hasRole(FOUNDER, account);
  }

  // MEMBER functions
  function addMember(address newMember) public onlyAdmin {
    _grantRole(MEMBER, newMember);
    daoToken.grantRole(daoToken.WHITELISTED(), newMember);
  }

  // ADMIN functions
  modifier onlyAdmin() {
    require(isAdmin(msg.sender), "Restricted to admins.");
    _;
  }

  function isAdmin(address account) public virtual view returns (bool) {
    return hasRole(ADMIN, account);
  }

  function addAdmin(address account) public virtual onlyOwner {
    _grantRole(ADMIN, account);
  }

  function renounceAdmin() public virtual {
    renounceRole(ADMIN, msg.sender);
  }
}