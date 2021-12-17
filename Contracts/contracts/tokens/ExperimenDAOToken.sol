// SPDX-License-Identifier: MIT
/// @author Brian Lundin
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ExperimenDAO Token
contract ExperimenDAOToken is ERC20PresetMinterPauser, Ownable {
  bytes32 public constant WHITELISTED = keccak256("WHITELISTED");

  /**
    * @dev The constructor uses the ERC20PresetMinterPauser
    * @param _initialSupply is the starting supply of this token. This number can never be changed.
    */
  constructor(uint256 _initialSupply) ERC20PresetMinterPauser("ExperimenDAO", "EXD") {
    _grantRole(WHITELISTED, msg.sender);
    _mint(msg.sender, _initialSupply * 10 ** 18);
  }

  /**
    * @dev This token can only be sent to address on the whitelist, as this is a private DAO.
    */
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);
    require(hasRole(WHITELISTED, to), "Invalid recipient");
  }
}