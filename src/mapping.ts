import { Address, BigInt, store } from "@graphprotocol/graph-ts"
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
    nft.createdAt = event.block.timestamp;

    let tryTokenUri = contract.try_tokenURI(event.params.id);
    nft.tokenURI = (tryTokenUri.reverted) ? '' : tryTokenUri.value;

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
  updateOwnership(nftId, event.params.to, BIGINT_ONE);
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