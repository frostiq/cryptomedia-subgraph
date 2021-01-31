import { ERC721, Transfer } from "../generated/templates/NftContract/ERC721"
import { Nft, NftContract } from "../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { KnowOrigin } from "../generated/KnowOrigin/KnowOrigin";
import { KNOW_ORIGIN, ZERO_ADDRESS } from "./constants";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

export function handleTransferKnowOrigin(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "KnowOrigin";
    nftContract.save();
  }
    
  handleTransfer(event);
  
  let id = event.transaction.hash.toHex() + "/" + event.logIndex.toString()
  let nft = Nft.load(id);
  if (nft.creatorAddress == null) {
    nft.creatorAddress = getAddressOfCreator(event.address, nft.tokenID);
    nft.save();
  }
}


function getAddressOfCreator(address: Address, tokenId: BigInt): Address {
  if (address == KNOW_ORIGIN) {
    let contract = KnowOrigin.bind(address);
    return contract.ownerOf(tokenId);
  } else {
    log.warning("KnowOrigin contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}