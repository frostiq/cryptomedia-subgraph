import { Address } from "@graphprotocol/graph-ts";
import { TransferSingle, TransferBatch } from "../generated/Rarible/ERC1155";
import { NftContract } from "../generated/schema"
import { fetchName, fetchSymbol } from "./mapping";
import { handleTransferBatch, handleTransferSingle, handleURI } from "./mappings-erc-1155";

export { handleURI };

export function handleTransferSingleRarible(event: TransferSingle): void {
  ensureNftContract(event.address);
  handleTransferSingle(event);
}

export function handleTransferBatchRarible(event: TransferBatch): void {
  ensureNftContract(event.address);
  handleTransferBatch(event);
}

function ensureNftContract(address: Address): void{
  if (NftContract.load(address.toHexString()) == null) {
    let nftContract = new NftContract(address.toHexString());
    nftContract.name = fetchName(address);
    nftContract.symbol = fetchSymbol(address);
    nftContract.platform = "Rarible";
    nftContract.save();
  }
}