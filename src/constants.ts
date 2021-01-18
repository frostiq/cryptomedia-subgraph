import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";

// Platform contract addresses
export let NIFTY_GATEWAY = Address.fromString("0x431bd1297a1c7664D599364a427A2d926a1f58aE");
export let RARIBLE = Address.fromString("0xd07dc4262BCDbf85190C01c996b4C06a461d2430");
export let SUPERRARE = Address.fromString("0x41a322b28d0ff354040e2cbc676f0320d8c8850d");
export let SUPERRARE_V2 = Address.fromString("0xb932a70A57673d89f4acfFBE830E8ed7f75Fb9e0");

export let ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
