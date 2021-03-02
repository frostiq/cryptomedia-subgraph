import { ERC721, Transfer } from "../generated/templates/NftContract/ERC721"
import { Nft, NftContract } from "../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { KnownOrigin } from "../generated/KnownOrigin/KnownOrigin";
import { KNOW_ORIGIN, ZERO_ADDRESS } from "./constants";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

export function handleTransferKnownOrigin(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "KnownOrigin";
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
  if (address == KNOW_ORIGIN) {
    let contract = KnownOrigin.bind(address);
    return contract.ownerOf(tokenId);
  } else {
    log.warning("KnownOrigin contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}