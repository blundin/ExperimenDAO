// SPDX-License-Identifier: MIT
/// @author Brian Lundin
pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./InvestmentPool.sol";
import "./tokens/ExperimenDAOToken.sol";

/// @title DAOCoordinator
/// @dev The Coordinator contract maintains ownsership of the 
/// contracts and coordinates their operations.
contract DAOCoordinator is Ownable {
  address public constant ZERO_ADDRESS = address(0);

  ExperimenDAOToken public daoToken;
  InvestmentPool public investmentPool;

  bool public initialized;

  constructor(ExperimenDAOToken _token, InvestmentPool _pool) {
    daoToken = _token;
    investmentPool = _pool;
  }

  function initializeContracts() external onlyOwner {
    require(!initialized, "DAOCoordinator: Contract is already initialized.");
    require(address(daoToken) != ZERO_ADDRESS, "DAOCoordinator: The DAO token must be set.");
    require(address(investmentPool) != ZERO_ADDRESS, "DAOCoordinator: The Investment Pool must be set.");
    
    daoToken.initialize();
    investmentPool.initialize(daoToken);
    daoToken.grantRole(daoToken.DEFAULT_ADMIN_ROLE(), address(investmentPool));

    initialized = true;
  }

  /* ------------- Investment Pool ------------- */

  // TODO
  function migrateInvestmentPool(address newPoolAddress) external onlyOwner {
    require(newPoolAddress != ZERO_ADDRESS, "DAOCoordinator: You must pass in a new investment pool address.");
    
    address previousPool = address(investmentPool);
    investmentPool = InvestmentPool(newPoolAddress);

    // _grantRole(WHITELISTED, address(investmentPool));
    // _grantRole(DEFAULT_ADMIN_ROLE, address(investmentPool));
    
    if (previousPool == address(0x0)) {
      // movePoolFrom(owner(), address(investmentPool));
    } else {
      // movePoolFrom(previousPool, address(investmentPool));
    }
  }
}