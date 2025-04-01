// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NickNameService} from "../src/NickNameService.sol";
//#20147499493997875391309541615370766948495478027592984763353050765533644272004
contract NickNameScript is Script {
    NickNameService public NNS;

    function setUp() public {}

    function run() public {
        console.logBytes(type(NickNameService).creationCode);
        //vm.startBroadcast();

        //NNS = new NickNameService();

        //vm.stopBroadcast();
    }
}
