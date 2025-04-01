// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "forge-std/Test.sol";
import "../src/NickNameService.sol";
import "solady/utils/LibString.sol";

contract NickNameServiceTest is Test {
    using LibString for string;

    NickNameService nns;
    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);
    bytes32 testKeyHash = keccak256(abi.encodePacked("test.eth"));

    string public constant a2z = "0123456789abcdefghijklmnopqrstuvwxyz-";

    function setUp() public {
        nns = new NickNameService();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }

    function testValidCharacters() public {
        // Test all valid characters
        vm.prank(alice);
        nns.mint(bob, "abc123-xyz"); // lowercase letters, numbers, and hyphen
        assertEq(nns.getNickname(0), "abc123-xyz");

        // Test uppercase letters (should fail)
        vm.prank(alice);
        vm.expectRevert(NickNameService.InvalidCharacters.selector);
        nns.mint(bob, "ABC123-XYZ");

        // Test special characters
        vm.prank(alice);
        vm.expectRevert(NickNameService.InvalidCharacters.selector);
        nns.mint(bob, "abc@123");

        // Test spaces
        vm.prank(alice);
        vm.expectRevert(NickNameService.InvalidCharacters.selector);
        nns.mint(bob, "abc 123");

        // Test underscore
        vm.prank(alice);
        vm.expectRevert(NickNameService.InvalidCharacters.selector);
        nns.mint(bob, "abc_123");
    }

    function testLookupValue() public {
        // The lookup value should only allow 0-9, a-z, and -
        uint128 expectedLookup = 10633823807823001954989765380701945856;
        assertEq(nns.lookup(), expectedLookup);
    }

    function testMintNickname() public {
        vm.prank(alice);
        nns.mint(bob, "alice-name");

        assertEq(nns.getNickname(0), "alice-name");
        assertEq(nns.ownerOf(0), bob);
        assertEq(nns.balanceOf(bob), 1);
    }

    function testNicknameTooShort() public {
        vm.prank(alice);
        vm.expectRevert(NickNameService.NicknameTooShort.selector);
        nns.mint(bob, "al");
    }

    function testNicknameTooLong() public {
        vm.prank(alice);
        vm.expectRevert(NickNameService.NicknameTooLong.selector);
        nns.mint(bob, "this-is-a-very-long-nickname-that-exceeds-the-limit");
    }

    function testCannotMintToSelf() public {
        vm.prank(alice);
        vm.expectRevert(NickNameService.CannotMintToSelf.selector);
        nns.mint(alice, "self-name");
    }

    function testInvalidCharacters() public {
        vm.prank(alice);
        vm.expectRevert(NickNameService.InvalidCharacters.selector);
        nns.mint(bob, "alice@name"); // @ is not allowed
    }

    function testTotalSupply() public {
        assertEq(nns.totalSupply(), 0);

        vm.prank(alice);
        nns.mint(bob, "alice-name");
        assertEq(nns.totalSupply(), 1);

        vm.prank(bob);
        nns.mint(charlie, "bob-name");
        assertEq(nns.totalSupply(), 2);
    }

    function testSupportsInterface() public {
        // Test ERC721 interface ID
        assertTrue(nns.supportsInterface(0x80ac58cd));
        
        // Test ERC165 interface ID
        assertTrue(nns.supportsInterface(0x01ffc9a7));
        
        // Test unsupported interface ID
        assertFalse(nns.supportsInterface(0x12345678));
    }

    function testTokenURI() public {
        vm.prank(alice);
        nns.mint(bob, "test-name");
        
        string memory uri = nns.tokenURI(0);
        assertTrue(bytes(uri).length > 0);
        assertTrue(uri.startsWith("data:application/json,"));
    }

    function testManagementFunctions() public {
        address newOwner = address(0x4);
        address newURIContract = address(0x5);
        
        // Test setOwner
        vm.prank(alice);
        vm.expectRevert("Only owner can call this function");
        nns.setOwner(newOwner);
        
        vm.prank(address(0x9906B794407BBe3C1Ca9741fdB30Dc2fACc838DE)); // Original owner
        nns.setOwner(newOwner);
        assertEq(nns.owner(), newOwner);
        
        // Test setURIContract
        vm.prank(alice);
        vm.expectRevert("Only owner can call this function");
        nns.setURIContract(newURIContract);
        
        vm.prank(newOwner);
        nns.setURIContract(newURIContract);
        assertEq(address(nns.uriContract()), newURIContract);
    }

    function testWithdraw() public {
        // Test ETH withdrawal
        vm.deal(address(nns), 1 ether);
        uint256 balanceBefore = address(0x9906B794407BBe3C1Ca9741fdB30Dc2fACc838DE).balance;
        
        vm.prank(address(0x9906B794407BBe3C1Ca9741fdB30Dc2fACc838DE));
        nns.withdraw();
        
        assertEq(address(0x9906B794407BBe3C1Ca9741fdB30Dc2fACc838DE).balance, balanceBefore + 1 ether);
    }

    function testTokenByIndex() public {
        assertEq(nns.tokenByIndex(0), 0);
        assertEq(nns.tokenByIndex(1), 1);
        assertEq(nns.tokenByIndex(999), 999);

        console.logBytes(type(NickNameService).creationCode);
    }
}
