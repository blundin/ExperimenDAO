// SPDX-License-Identifier: MIT
/// @author Brian Lundin
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../InvestmentPool.sol";

/// @title ExperimenDAO Token
contract ExperimenDAOToken is ERC20PresetMinterPauser, Ownable {
  bytes32 public constant WHITELISTED = keccak256("WHITELISTED");

  InvestmentPool private investmentPool;

  /**
    * @dev The constructor uses the ERC20PresetMinterPauser
    * @param _initialSupply is the starting supply of this token. This number can never be changed.
    */
  constructor(uint256 _initialSupply) ERC20PresetMinterPauser("ExperimenDAO", "EXD") {
    _grantRole(WHITELISTED, msg.sender);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _mint(msg.sender, _initialSupply * 10 ** 18);
  }

  function migrateInvestmentPool(address newPoolAddress) external onlyOwner {
    address previousPool = address(investmentPool);

    investmentPool = InvestmentPool(newPoolAddress);
    _grantRole(WHITELISTED, address(investmentPool));
    _grantRole(DEFAULT_ADMIN_ROLE, address(investmentPool));
    
    if (previousPool == address(0x0)) {
      movePoolFrom(owner(), address(investmentPool));
    } else {
      movePoolFrom(previousPool, address(investmentPool));
    }
  }

  function movePoolFrom(address oldPool, address newPool) private {
    uint256 currentBalance = balanceOf(oldPool);
    _revokeRole(DEFAULT_ADMIN_ROLE, oldPool);
    _revokeRole(WHITELISTED, oldPool);
    _transfer(oldPool, newPool, currentBalance);
  } 

  function getInvestmentPool() external view returns (address) {
    return address(investmentPool);
  }

  /**
    * @dev This token can only be sent to address on the whitelist, as this is a private DAO.
    */
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);
    require(hasRole(WHITELISTED, to), "Invalid recipient");
  }
}