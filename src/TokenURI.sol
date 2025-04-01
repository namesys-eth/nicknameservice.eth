// SPDX-License-Identifier: WTFPL.ETH
pragma solidity 0.8.29;

import "solady/utils/Base64.sol";
import "solady/utils/LibString.sol";

library SVG {
    using LibString for string;

    function toHexColor(string memory name) public pure returns (string[11] memory _output) {
        bytes32 hash = keccak256(abi.encodePacked(name));
        bytes memory _base = "0123456789abcdef";
        unchecked {
            for (uint256 i; i < 11; i++) {
                uint8 byte1 = uint8(hash[i * 2]);
                uint8 byte2 = uint8(hash[i * 2 + 1]);
                _output[i] = string(abi.encodePacked(_base[byte1 / 16], _base[byte1 % 16], _base[byte2 / 16]));
            }
        }
    }

    function generateSVG(string memory name) internal pure returns (string memory) {
        string[11] memory colors = toHexColor(name);
        return string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" style="user-select:none; font-family: monospace;">',
            generateDefs(),
            generateGradient("a", colors[0], colors[1], colors[2], colors[3]),
            generateGradient("b", colors[4], colors[5], colors[6], colors[7]),
            generateAnimate(colors[8], colors[9], colors[10]),
            '<rect width="100" height="100" rx="10" ry="10" fill="#111"/>',
            '<rect x="5" y="5" width="90" height="90" rx="8" class="b"/>',
            '<rect x="10" y="10" width="80" height="80" rx="5" class="i"/>',
            '<rect x="15" y="15" width="70" height="70" rx="5" class="b" opacity=".9"/>',
            '<text x="50" y="35" class="l" style="font-size: 15px;">NNS</text>',
            '<text x="50" y="45" class="l">Nick Name Service</text>',
            '<rect x="15" y="60" width="70" height="15" rx="5" fill="rgba(0,0,0,0.3)"/>',
            '<text x="50" y="68" class="n" textLength="62" lengthAdjust="spacingAndGlyphs">',
            name,
            "</text>",
            genScrollText(),
            "</svg>"
        );
    }

    function generateGradient(
        string memory id,
        string memory color1,
        string memory color2,
        string memory color3,
        string memory color4
    ) internal pure returns (string memory) {
        bytes memory idBytes = bytes(id);
        string memory direction =
            idBytes[0] == bytes1("b") ? 'x1="100%" y1="0%" x2="0%" y2="100%"' : 'x1="0%" y1="0%" x2="100%" y2="100%"';
        return string.concat(
            '<linearGradient id="',
            id,
            '" ',
            direction,
            ">",
            '<stop offset="0%" stop-color="#',
            color1,
            '"/>',
            '<stop offset="33%" stop-color="#',
            color2,
            '"/>',
            '<stop offset="66%" stop-color="#',
            color3,
            '"/>',
            '<stop offset="100%" stop-color="#',
            color4,
            '"/>',
            "</linearGradient>"
        );
    }

    function generateAnimate(string memory color1, string memory color2, string memory color3)
        internal
        pure
        returns (string memory)
    {
        return string.concat(
            '<linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="0%">',
            '<stop offset="0%" stop-color="#',
            color1,
            '"><animate attributeName="stop-color" values="#',
            color1,
            ";#",
            color2,
            ";#",
            color3,
            ";#",
            color1,
            '" dur="2s" repeatCount="indefinite"/></stop>',
            '<stop offset="50%" stop-color="#',
            color2,
            '"><animate attributeName="stop-color" values="#',
            color2,
            ";#",
            color3,
            ";#",
            color1,
            ";#",
            color2,
            '" dur="2s" repeatCount="indefinite"/></stop>',
            '<stop offset="100%" stop-color="#',
            color3,
            '"><animate attributeName="stop-color" values="#',
            color3,
            ";#",
            color1,
            ";#",
            color2,
            ";#",
            color3,
            '" dur="2s" repeatCount="indefinite"/></stop>',
            "</linearGradient>"
        );
    }

    function generateDefs() internal pure returns (string memory) {
        return string.concat(
            "<defs>",
            '<filter id="s"><feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" flood-color="rgba(0,0,0,0.5)"/></filter>',
            '<path id="p" d="M12,4 H88 A8,8 0 0 1 96,12 V88 A8,8 0 0 1 88,96 H12 A8,8 0 0 1 4,88 V12 A8,8 0 0 1 12,4 Z"/>',
            "<style>.b{fill:url(#a)}.i{fill:url(#b)}.l{fill:#fff;text-anchor:middle;font-size:6px;font-weight:bold;filter:url(#s)}.n{text-anchor:middle;font-size:10px;dominant-baseline:middle;text-transform:uppercase;filter:url(#s)}.s{font-size:2.95px;filter:url(#s)}</style>",
            "</defs>"
        );
    }

    function genScrollText() internal pure returns (string memory) {
        string memory scroll =
            string.concat(string(unicode"Nick Name Service ★ ").repeat(4), unicode"Nick Name Service ★");
        string memory aniText = string.concat(
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
            "</text>"
        );
        return aniText;
    }
}

contract TokenURI {
    using LibString for string;
    using LibString for uint256;
    using SVG for string;

    function tokenURI(uint256 tokenId, string memory name) public pure returns (string memory) {
        string memory image = string.concat("data:image/svg+xml;base64,", Base64.encode(bytes(name.generateSVG())));
        string memory id = tokenId.toString();
        string memory len = bytes(name).length.toString();
        string memory attributes = string.concat(
            '{"trait_type":"Nick Name","value":"',
            name,
            '"},{"trait_type":"Length","value":"',
            len,
            '"},{"trait_type":"ENS","value":"',
            id,
            '.NickNameService.eth"}'
        );
        return string.concat(
            "data:application/json,",
            string.concat(
                '{"name":"',
                name,
                '","description":"Soulbound Nick Name Service NFT",',
                '"image":"',
                image,
                '","attributes":[',
                attributes,
                ']}'
            )
        );
    }
}
