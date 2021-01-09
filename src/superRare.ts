import { Transfer } from "../generated/templates/NftContract/ERC721";
import { NftContract } from "../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";

export function handleTransferSuperRare(event: Transfer): void {
  handleTransfer(event);

  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "SuperRare";
    nftContract.save();
  }
}
