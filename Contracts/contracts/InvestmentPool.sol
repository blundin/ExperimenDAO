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
  address public constant ZERO_ADDRESS = address(0);

  bytes32 public constant FOUNDER = keccak256("FOUNDER");
  bytes32 public constant MEMBER = keccak256("MEMBER");
  bytes32 public constant ADMIN = keccak256("ADMIN");

  bool public initialized;

  ExperimenDAOToken public daoToken;
  mapping(address => bool) founders;
  mapping(address => bool) members;

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ADMIN, msg.sender);
    
    _setRoleAdmin(ADMIN, DEFAULT_ADMIN_ROLE);
    _setRoleAdmin(FOUNDER, ADMIN);
    _setRoleAdmin(MEMBER, ADMIN);
  }

  function initialize(ExperimenDAOToken _daoToken) external onlyOwner {
    require(!initialized, "InvestmentPool: Contract is already initialized");
    require(address(_daoToken) != ZERO_ADDRESS, "DAOCoordinator: The DAO token must be set.");

    daoToken = _daoToken;

    initialized = true;
  }

  function transferOwnership(address newOwner) public override onlyOwner {
    _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
    _grantRole(ADMIN, newOwner);

    _revokeRole(ADMIN, msg.sender);
    _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _checkRole(DEFAULT_ADMIN_ROLE, newOwner);
    _checkRole(ADMIN, newOwner);

    super._transferOwnership(newOwner);
  }

  // FOUNDER functions
  function addFounder(address newFounder) public onlyAdmin {
    _grantRole(FOUNDER, newFounder);
    founders[newFounder] = true;

    _grantRole(MEMBER, newFounder);
    daoToken.grantRole(daoToken.WHITELISTED(), newFounder);
    members[newFounder] = true;
  }

  modifier onlyFounder() { 
    require(isFounder(msg.sender) && founders[msg.sender], "Restricted to founders." );
    _;
  }

  function isFounder(address account) public view returns (bool) {
    return founders[account] && hasRole(FOUNDER, account);
  }

  // MEMBER functions
  modifier onlyMember() {
    require(isMember(msg.sender), "Restricted to members.");
    _;
  }

  function addMember(address newMember) public onlyAdmin {
    _grantRole(MEMBER, newMember);
    daoToken.grantRole(daoToken.WHITELISTED(), newMember);
    members[newMember] = true;
  }

  function isMember(address account) public virtual view returns (bool) {
    return hasRole(MEMBER, account);
  }

  function removeMember(address goodbye) public onlyAdmin {
    _revokeRole(MEMBER, goodbye);
    daoToken.revokeRole(daoToken.WHITELISTED(), goodbye);
    members[goodbye] = false;
  }

  // ADMIN functions
  modifier onlyAdmin() {
    require(isAdmin(msg.sender), "Restricted to admins.");
    _;
  }

  function addAdmin(address account) public virtual onlyOwner {
    _grantRole(ADMIN, account);
  }

  function isAdmin(address account) public virtual view returns (bool) {
    return hasRole(ADMIN, account);
  }

  function renounceAdmin() public virtual {
    renounceRole(ADMIN, msg.sender);
  }
}