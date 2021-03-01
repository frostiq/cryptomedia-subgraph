import { TransferSingle, TransferBatch } from "../generated/Rarible/ERC1155";
import { NftContract } from "../generated/schema"
import { fetchName, fetchSymbol } from "./mapping";
import { handleTransferSingle, handleURI } from "./mappings-erc-1155";

export { handleURI };

export function handleTransferSingleMeme(event: TransferSingle): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "Meme";
    nftContract.save();
  }

  handleTransferSingle(event)
}

export function handleTransferBatch(event: TransferBatch): void {
  // TODO: implement
}