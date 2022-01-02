// SPDX-License-Identifier: MIT
/// @author Brian Lundin
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../InvestmentPool.sol";

/// @title ExperimenDAO Token
contract ExperimenDAOToken is ERC20PresetMinterPauser, Ownable {
  address public constant ZERO_ADDRESS = address(0);

  bytes32 public constant WHITELISTED = keccak256("WHITELISTED");

  bool public initialized;

  InvestmentPool private investmentPool;

  /// @dev The constructor uses the ERC20PresetMinterPauser
  /// @param _initialSupply is the starting supply of this token. This number can never be changed.
  constructor(uint256 _initialSupply) ERC20PresetMinterPauser("ExperimenDAO", "EXD") {
    _grantRole(WHITELISTED, msg.sender);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _mint(msg.sender, _initialSupply * 10 ** 18);
  }

  function initialize() external onlyOwner {
    // TODO
    initialized = true;
  }

  function transferOwnership(address newOwner) public override onlyOwner {
    require(newOwner != ZERO_ADDRESS, "ExperimenDAOToken: You cannot transfer ownership to the 0x000... address.");

    _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
    _grantRole(WHITELISTED, newOwner);
    
    _revokeRole(WHITELISTED, msg.sender);
    _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _checkRole(DEFAULT_ADMIN_ROLE, newOwner);
    _checkRole(WHITELISTED, newOwner);

    super._transferOwnership(newOwner);

    uint256 currentBalance = balanceOf(msg.sender);
    _transfer(msg.sender, newOwner, currentBalance);
  }
  
  /// @dev This token can only be sent to address on the whitelist, as this is a private DAO.
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);
    // require(hasRole(WHITELISTED, from), "ExperimenDAOToken: Invalid sender");
    require(hasRole(WHITELISTED, to), "ExperimenDAOToken: Invalid recipient");
  }
}