// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

interface INickNameService {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // Errors
    error NicknameTooShort();
    error NicknameTooLong();
    error CannotMintToSelf();
    error InvalidCharacters();

    // View Functions
    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function ownerOf(uint256) external view returns (address);
    function tokenOfOwnerByIndex(address, uint256) external view returns (uint256);
    function tokenByIndex(uint256) external pure returns (uint256);
    function getNickname(uint256) external view returns (string memory);
    function tokenURI(uint256) external view returns (string memory);
    function owner() external view returns (address);
    function uriContract() external view returns (address);
    function lookup() external view returns (uint128);

    // State Changing Functions
    function mint(address to, string calldata _nickname) external;
    function setURIContract(address _uriContract) external;
    function setOwner(address _owner) external;
    function withdraw() external;
    function withdraw(address token) external;
    function withdraw(address token, uint256 amount) external;
} 