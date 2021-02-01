import { Transfer } from "../../generated/templates/NftContract/ERC721";
import { Nft, NftContract } from "../../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { SuperRare } from "../../generated/SuperRare/SuperRare";
import { SuperRareV2 } from "../../generated/SuperRareV2/SuperRareV2";
import { SUPERRARE, SUPERRARE_V2, ZERO_ADDRESS } from "../constants/index";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

export function handleTransferSuperRare(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "SuperRare";
    nftContract.save();
  }

  handleTransfer(event);

  let id = address + "/" + event.params.id.toString();
  let nft = Nft.load(id);
  if (nft.creatorAddress == null) {
    nft.creatorAddress = getAddressOfCreator(event.address, nft.tokenID);
    nft.save();
  }
}

function getAddressOfCreator(address: Address, tokenId: BigInt): Address {
  if (address == SUPERRARE) {
    let contract = SuperRare.bind(address);
    return contract.creatorOfToken(tokenId);
  } else if (address == SUPERRARE_V2) {
    let contract = SuperRareV2.bind(address);
    return contract.tokenCreator(tokenId);
  } else {
    log.warning("SuperRare contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}
