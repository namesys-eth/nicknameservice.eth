// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "solady/utils/LibString.sol";
import "./TokenURI.sol";

interface iERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface iERC721 {
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function approve(address _approved, uint256 _tokenId) external payable;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

interface iERC721Metadata is iERC721 {
    function name() external view returns (string memory _name);
    function symbol() external view returns (string memory _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}

interface iERC721Enumerable is iERC721 {
    function totalSupply() external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
}

contract NickNameService {
    string public constant name = "Nick Name Service";
    string public constant symbol = "NNS";

    uint256 public totalSupply;
    TokenURI public uriContract = new TokenURI();
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => string) public nicknames;
    mapping(address => mapping(uint256 => uint256)) public tokenOfOwnerByIndex;

    // lib String 7Bit ASCII Allowed Lookup("0-9, a-z & -") map
    uint128 public constant lookup = 10633823807823001954989765380701945856;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(iERC721).interfaceId || interfaceId == type(iERC165).interfaceId;
    }

    error NicknameTooShort();
    error NicknameTooLong();
    error CannotMintToSelf();
    error InvalidCharacters();

    function mint(address to, string calldata _nickname) external {
        require(bytes(_nickname).length > 2, NicknameTooShort());
        require(bytes(_nickname).length < 33, NicknameTooLong());
        require(LibString.is7BitASCII(_nickname, lookup), InvalidCharacters());
        uint256 id = totalSupply;
        unchecked {
            tokenOfOwnerByIndex[to][balanceOf[to]] = id;
            ++balanceOf[to];
            ++totalSupply;
        }
        ownerOf[id] = to;
        nicknames[id] = _nickname;
        emit Transfer(address(0), to, id);
        require(to != msg.sender, CannotMintToSelf());
    }

    function tokenByIndex(uint256 index) external pure returns (uint256) {
        return index;
    }

    function getNickname(uint256 id) external view returns (string memory) {
        return nicknames[id];
    }

    function tokenURI(uint256 id) external view returns (string memory) {
        return uriContract.tokenURI(id, nicknames[id]);
    }

    // Management functions
    address public owner = 0x9906B794407BBe3C1Ca9741fdB30Dc2fACc838DE;

    function setURIContract(address _uriContract) external onlyOwner {
        uriContract = TokenURI(_uriContract);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function withdraw() external {
        payable(owner).transfer(address(this).balance);
    }

    function withdraw(address token) external {
        iToken(token).transfer(owner, iToken(token).balanceOf(address(this)));
    }

    function withdraw(address token, uint256 amount) external {
        iToken(token).transferFrom(address(this), owner, amount);
    }
}

interface iToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
