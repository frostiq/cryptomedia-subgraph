import {
  WhitelistCreator,
  Bid,
  AcceptBid,
  CancelBid,
  Sold,
  SalePriceSet,
  OwnershipTransferred,
  Transfer,
  Approval,
  SuperRare,
} from "../generated/SuperRare/SuperRare";
import { Nft, NftContract } from "../generated/schema";
import { ZERO_ADDRESS } from "./constants";

/**
 * Standard ERC721
 */
export function handleTransfer(event: Transfer): void {
  let contract = SuperRare.bind(event.address);
  let address = event.address.toHexString();
  let tokenId = address + "/" + event.params._tokenId.toString();

  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = contract.name();
    nftContract.symbol = contract.symbol();
    nftContract.platform = "SuperRare";
    nftContract.save();
  }

  let nft = Nft.load(tokenId);
  if (nft == null) {
    nft = new Nft(tokenId);
    nft.contract = address;
    nft.tokenID = event.params._tokenId;
    nft.tokenURI = contract.tokenURI(event.params._tokenId);
    nft.createdAt = event.block.timestamp;
  }
  if (event.params._to.toHex() == ZERO_ADDRESS) {
    // burn token
    nft.removedAt = event.block.timestamp;
  }
  nft.owner = event.params._to;
  nft.save();
}

export function handleApproval(event: Approval): void { }

/**
 * SuperRare specific
 */
export function handleWhitelistCreator(event: WhitelistCreator): void { }

export function handleBid(event: Bid): void { }

export function handleAcceptBid(event: AcceptBid): void { }

export function handleCancelBid(event: CancelBid): void { }

export function handleSold(event: Sold): void { }

export function handleSalePriceSet(event: SalePriceSet): void { }

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }
