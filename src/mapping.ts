<<<<<<< HEAD
import { Address } from "@graphprotocol/graph-ts"
import { TransferSingle, TransferBatch, URI, ERC1155 } from "../generated/Rarible/ERC1155";
import { Transfer as KnowOriginTransferEvent } from "../generated/KnowOrigin/KnowOrigin";
=======
import { Address, BigInt, store } from "@graphprotocol/graph-ts"
import { URI } from "../generated/Rarible/ERC1155";
>>>>>>> frosq/erc1155-semifungibility-support
import { ERC721, Transfer } from "../generated/templates/NftContract/ERC721"
import { Nft, Ownership } from "../generated/schema"
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "./constants";

export function handleTransfer(event: Transfer): void {
  let address = event.address.toHexString();
  let nftId = address + "/" + event.params.id.toString();
  let contract = ERC721.bind(event.address);
  let nft = Nft.load(nftId);
  if (nft == null) {
    nft = new Nft(nftId);
    nft.contract = address;
    nft.tokenID = event.params.id;
    nft.tokenURI = contract.tokenURI(event.params.id);
    nft.createdAt = event.block.timestamp;
    nft.save();
  }

  if (event.params.to == ZERO_ADDRESS) {
    // burn token
    nft.removedAt = event.block.timestamp;
    nft.save();
  }

  if (event.params.from != ZERO_ADDRESS) {
    updateOwnership(nftId, event.params.from, BIGINT_ZERO.minus(BIGINT_ONE));
  }
<<<<<<< HEAD

  nft.owner = event.params._to;
  nft.save();
}

export function handleTransferKnowOrigin(event: KnowOriginTransferEvent): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);

    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "KnowOrigin";
    nftContract.save();
  }

  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let contract = ERC721.bind(event.address);
  let nft = Nft.load(id);
  if (nft == null) {
    nft = new Nft(id);
    nft.contract = event.address.toHexString();
    nft.tokenID = event.params._tokenId;
    nft.creatorName = contract.nameOfCreator();
    nft.tokenURI = contract.tokenURI(event.params._tokenId);

  }

  nft.owner = event.params._to
  nft.save();
}

export function handleTransferBatch(event: TransferBatch): void { 
  // TODO: implement
}

export function handleURI(event: URI): void { 
  let id = event.address.toHexString() + "/" + event.params._id.toString();
  let nft = new Nft(id);
  nft.tokenURI = event.params._value;
  nft.save();
=======
  updateOwnership(nftId, event.params.to, BIGINT_ONE);
>>>>>>> frosq/erc1155-semifungibility-support
}

export function fetchName(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.name();
}

export function fetchSymbol(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.symbol();
}

export function updateOwnership(nftId: string, owner: Address, deltaQuantity: BigInt): void {
  let ownershipId = nftId + "/" + owner.toHexString();
  let ownership = Ownership.load(ownershipId);

  if (ownership == null) {
    ownership = new Ownership(ownershipId);
    ownership.nft = nftId;
    ownership.owner = owner;
    ownership.quantity = BIGINT_ZERO;
  }

  let newQuantity = ownership.quantity.plus(deltaQuantity);

  if (newQuantity.lt(BIGINT_ZERO)) {
    throw new Error("Negative token quantity")
  }

  if (newQuantity.isZero()) {
    store.remove('Ownership', ownershipId);
  } else {
    ownership.quantity = newQuantity;
    ownership.save();
  }
}