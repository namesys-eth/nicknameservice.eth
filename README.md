# NickNameService.eth - Soulbound Nicknames

A Solidity implementation of fully on-chain soulbound ERC721 NFT for nickname system with SVG metadata. Tag addresses as good, bad, or whatever you want - like Etherscan's tags but fully on-chain and soulbound.

## Overview

The NickNameService contract allows users to mint tags as soulbound NFTs for any address. Each tag is associated with a beautiful SVG image that includes:
- Dynamic color gradients based on the tag
- Animated scrolling text
- Modern UI design with rounded corners and shadows
- Responsive layout

Unlike Etherscan's tags, these tags are:
- On-chain and immutable
- Non-transferable (soulbound)
- Beautifully visualized as NFTs
- Private to each user

## Key Features

- **Soulbound NFTs**: Each tag is minted as a unique, non-transferable NFT
- **Beautiful SVG Metadata**: Dynamic and animated SVG images for each tag
- **Character Validation**: Only allows 7-bit ASCII characters (0-9, a-z & -)
- **Length Limits**: Tags must be between 3 and 32 characters

## Use Cases

### Address Tagging
- Tag addresses as good or bad
- Tag scammers and malicious contracts
- Tag whatever you want - it's your tag

### Example Scenarios
```solidity
// Tag someone as good
nns.mint(friendAddress, "good-guy");

// Tag someone as bad
nns.mint(scammerAddress, "scammer");

// Tag whatever you want
nns.mint(contractAddress, "whatever");
```

## Smart Contract Structure

The contract implements the following core functionality:

- `mint`: Create a new tag NFT
- `tokenURI`: Get the metadata URI for a tag NFT
- `getNickname`: Retrieve the tag string for a token ID
- `tokenByIndex`: Get token ID by index
- `tokenOfOwnerByIndex`: Get token ID by owner and index

## Technical Details

The contract includes several technical features:

1. **SVG Generation**: Creates SVG images for each nickname
2. **Character Validation**: Uses a lookup table for 7-bit ASCII validation
3. **Metadata Format**: Returns JSON metadata with:
   - Name
   - Description
   - SVG image
   - Attributes (Nick Name, Length, ENS)
4. **ERC721 Compliance**: Implements standard NFT interface

## Design Considerations

- Tags are soulbound (non-transferable)
- SVG images are generated on-chain
- Metadata includes length and ENS-style attributes
- Uses Solady's efficient string and base64 utilities
- Simple and focused on tagging:
  - Tag addresses as you want
  - Same tag can be used for different addresses

## References
- Library used : [Vectorized/solady](https://github.com/vectorized/solady) 
- Inspired by : [An Introduction to Petname Systems](https://web.archive.org/web/20050310160854/http://www.skyhunter.com/marcs/petnames/IntroPetNames.html) by Marc Stiegler, Feb 2005

## License

Copyright © NameSys.eth (WTFPL.ETH)
