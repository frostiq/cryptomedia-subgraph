import { Transfer } from "../generated/templates/NftContract/ERC721";
import { Nft, NftContract } from "../generated/schema";
import { Sorare } from "../generated/Sorare/Sorare";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { SORARE, ZERO_ADDRESS } from "./constants";

export function handleTransferSorare(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "Sorare";
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
  if (address == SORARE) {
    let contract = Sorare.bind(address);
    return contract.ownerOf(tokenId);
  } else {
    log.warning("Sorare contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}
