import { Transfer } from "../generated/templates/NftContract/ERC721";
import { Nft, NftContract } from "../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";

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
    nft.creatorAddress = event.params.to;
    nft.save();
  }
}
