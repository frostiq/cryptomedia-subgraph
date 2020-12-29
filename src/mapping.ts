import { Address } from "@graphprotocol/graph-ts"
import { BuilderInstanceCreated } from "../generated/NiftyGateway/NiftyGateway"
import { TransferSingle, TransferBatch, URI, ERC1155 } from "../generated/Rarible/ERC1155";
import { NftContract as NftContractTemplate } from "../generated/templates"
import { ERC721, Transfer } from "../generated/templates/NftContract/ERC721"
import { NftContract, Nft } from "../generated/schema"

export function handleBuilderInstanceCreated(event: BuilderInstanceCreated): void {
  let address = event.params.new_contract_address;
  NftContractTemplate.create(address);

  let nftContract = new NftContract(address.toHexString());
  nftContract.name = fetchName(address);
  nftContract.symbol = fetchSymbol(address);
  nftContract.platform = "NiftyGateway";
  nftContract.save();
}

export function handleTransfer(event: Transfer): void {
  let id = event.address.toHexString() + "/" + event.params.id.toString();
  let contract = ERC721.bind(event.address);
  let nft = Nft.load(id);
  if (nft == null) {
    nft = new Nft(id);
    nft.contract = event.address.toHexString();
    nft.tokenID = event.params.id;
    nft.creatorName = contract.nameOfCreator();
    nft.tokenURI = contract.tokenURI(event.params.id);
  }

  nft.owner = event.params.to;
  nft.save();
}

export function handleTransferSingle(event: TransferSingle): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);

    // TODO: refactor as Rarible is not ERC721
    // TODO: handle event.params._value
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "Rarible";
    nftContract.save();
  }

  let id = address + "/" + event.params._id.toString();
  let contract = ERC1155.bind(event.address);
  let nft = Nft.load(id);
  if (nft == null) {
    nft = new Nft(id);
    nft.contract = address;
    nft.tokenID = event.params._id;
    nft.creatorAddress = contract.creators(event.params._id);
    nft.tokenURI = contract.uri(event.params._id);
  }

  nft.owner = event.params._to;
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
}

function fetchName(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.name();
}

function fetchSymbol(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.symbol();
}