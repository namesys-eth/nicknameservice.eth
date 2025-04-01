// SPDX-License-Identifier: MIT
pragma solidity >=0.8.29;

import {Test, console} from "forge-std/Test.sol";
import {TokenURI} from "../src/TokenURI.sol";
import {SVG} from "../src/TokenURI.sol";
import "solady/utils/Base64.sol";
import "solady/utils/LibString.sol";

contract TokenURITest is Test {
    using LibString for string;

    TokenURI public tokenURI;
    string constant TEST_NAME = "testname";

    function setUp() public {
        tokenURI = new TokenURI();
    }

    function testGenerateGradient() public {
        string memory gradient = SVG.generateGradient("a", "f06", "f0c", "0cf", "fc0");
        assertEq(
            gradient,
            '<linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f06"/><stop offset="33%" stop-color="#f0c"/><stop offset="66%" stop-color="#0cf"/><stop offset="100%" stop-color="#fc0"/></linearGradient>'
        );
    }

    function testGenerateAnimate() public {
        string memory animate = SVG.generateAnimate("fff", "0cf", "f0c");
        assertEq(
            animate,
            '<linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fff"><animate attributeName="stop-color" values="#fff;#0cf;#f0c;#fff" dur="2s" repeatCount="indefinite"/></stop><stop offset="50%" stop-color="#0cf"><animate attributeName="stop-color" values="#0cf;#f0c;#fff;#0cf" dur="2s" repeatCount="indefinite"/></stop><stop offset="100%" stop-color="#f0c"><animate attributeName="stop-color" values="#f0c;#fff;#0cf;#f0c" dur="2s" repeatCount="indefinite"/></stop></linearGradient>'
        );
    }

    function testGenerateDefs() public {
        string memory defs = SVG.generateDefs();
        assertEq(
            defs,
            '<defs><filter id="s"><feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" flood-color="rgba(0,0,0,0.5)"/></filter><path id="p" d="M12,4 H88 A8,8 0 0 1 96,12 V88 A8,8 0 0 1 88,96 H12 A8,8 0 0 1 4,88 V12 A8,8 0 0 1 12,4 Z"/><style>.b{fill:url(#a)}.i{fill:url(#b)}.l{fill:#fff;text-anchor:middle;font-size:6px;font-weight:bold;filter:url(#s)}.n{text-anchor:middle;font-size:10px;dominant-baseline:middle;text-transform:uppercase;filter:url(#s)}.s{font-size:2.95px;filter:url(#s)}</style></defs>'
        );
    }

    function testGenScrollText() public {
        string memory scrollText = SVG.genScrollText();
        assertTrue(bytes(scrollText).length > 0);
        assertTrue(stringsContains(scrollText, "text-rendering=\"optimizeSpeed\""));
        assertTrue(stringsContains(scrollText, "class=\"s\""));
        assertTrue(stringsContains(scrollText, "xlink:href=\"#p\""));
        assertTrue(stringsContains(scrollText, unicode"Nick Name Service ★"));
    }

    function testGenerateSVG() public {
        string memory svg = SVG.generateSVG(TEST_NAME);
        console.log(svg);
        string memory scroll = string.concat(
            string(unicode"Nick Name Service ★ ").repeat(4),
            unicode"Nick Name Service ★"
        );
        string memory expectedSvg = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" style="user-select:none; font-family: monospace;">',
            '<defs><filter id="s"><feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" flood-color="rgba(0,0,0,0.5)"/></filter><path id="p" d="M12,4 H88 A8,8 0 0 1 96,12 V88 A8,8 0 0 1 88,96 H12 A8,8 0 0 1 4,88 V12 A8,8 0 0 1 12,4 Z"/><style>.b{fill:url(#a)}.i{fill:url(#b)}.l{fill:#fff;text-anchor:middle;font-size:6px;font-weight:bold;filter:url(#s)}.n{text-anchor:middle;font-size:10px;dominant-baseline:middle;text-transform:uppercase;filter:url(#s)}.s{font-size:2.95px;filter:url(#s)}</style></defs>',
            '<linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#53e"/><stop offset="33%" stop-color="#e8e"/><stop offset="66%" stop-color="#c86"/><stop offset="100%" stop-color="#9b4"/></linearGradient>',
            '<linearGradient id="b" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#9da"/><stop offset="33%" stop-color="#e47"/><stop offset="66%" stop-color="#d86"/><stop offset="100%" stop-color="#63e"/></linearGradient>',
            '<linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#903"><animate attributeName="stop-color" values="#903;#c77;#2a3;#903" dur="2s" repeatCount="indefinite"/></stop><stop offset="50%" stop-color="#c77"><animate attributeName="stop-color" values="#c77;#2a3;#903;#c77" dur="2s" repeatCount="indefinite"/></stop><stop offset="100%" stop-color="#2a3"><animate attributeName="stop-color" values="#2a3;#903;#c77;#2a3" dur="2s" repeatCount="indefinite"/></stop></linearGradient>',
            '<rect width="100" height="100" rx="10" ry="10" fill="#111"/>',
            '<rect x="5" y="5" width="90" height="90" rx="8" class="b"/>',
            '<rect x="10" y="10" width="80" height="80" rx="5" class="i"/>',
            '<rect x="15" y="15" width="70" height="70" rx="5" class="b" opacity=".9"/>',
            '<text x="50" y="35" class="l" style="font-size: 15px;">NNS</text>',
            '<text x="50" y="45" class="l">Nick Name Service</text>',
            '<rect x="15" y="60" width="70" height="15" rx="5" fill="rgba(0,0,0,0.3)"/>',
            '<text x="50" y="68" class="n" textLength="62" lengthAdjust="spacingAndGlyphs">',
            TEST_NAME,
            "</text>",
            '<text fill="url(#c)" text-rendering="optimizeSpeed" class="s">',
            '<textPath startOffset="-100%" xlink:href="#p">',
            scroll,
            '<animate attributeName="startOffset" from="0%" to="100%" begin="0s" dur="21s" repeatCount="indefinite" additive="sum"/></textPath>',
            '<textPath startOffset="0%" xlink:href="#p">',
            scroll,
            '<animate attributeName="startOffset" from="0%" to="100%" begin="0s" dur="21s" repeatCount="indefinite" additive="sum"/></textPath>',
            '<textPath startOffset="-50%" xlink:href="#p">',
            scroll,
            '<animate attributeName="startOffset" from="0%" to="100%" begin="0s" dur="21s" repeatCount="indefinite" additive="sum"/></textPath>',
            '<textPath startOffset="50%" xlink:href="#p">',
            scroll,
            '<animate attributeName="startOffset" from="0%" to="100%" begin="0s" dur="21s" repeatCount="indefinite" additive="sum"/></textPath>',
            "</text>",
            "</svg>"
        );
        assertEq(svg, expectedSvg);
    }

    function testTokenURI() public {
        string memory json = tokenURI.tokenURI(1, TEST_NAME);
        assertTrue(bytes(json).length > 0);
        assertTrue(LibString.contains(json, "data:application/json,"));
        // Test basic fields
        assertTrue(LibString.contains(json, TEST_NAME));
        assertTrue(LibString.contains(json, "Soulbound Nick Name Service NFT"));
        assertTrue(LibString.contains(json, "data:image/svg+xml;base64,"));
        
        // Test attributes array
        assertTrue(LibString.contains(json, string.concat('"trait_type":"Nick Name","value":"', TEST_NAME, '"')));
        assertTrue(LibString.contains(json, '"trait_type":"Length","value":"8"'));
        assertTrue(LibString.contains(json, '"trait_type":"ENS","value":"1.NickNameService.eth"'));
    }

    function stringsContains(string memory str, string memory search) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory searchBytes = bytes(search);

        if (searchBytes.length > strBytes.length) return false;

        for (uint256 i = 0; i <= strBytes.length - searchBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < searchBytes.length; j++) {
                if (strBytes[i + j] != searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    function stringsSlice(string memory str, uint256 start) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(strBytes.length - start);
        for (uint256 i = start; i < strBytes.length; i++) {
            result[i - start] = strBytes[i];
        }
        return string(result);
    }
}
