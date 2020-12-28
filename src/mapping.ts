import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BuilderInstanceCreated } from "../generated/NiftyGateway/NiftyGateway"
import { NFTContract as NFTContractTemplate } from "../generated/templates"
import { ERC721, Transfer } from "../generated/templates/NFTContract/ERC721"
import { NFTContract, NFT } from "../generated/schema"

export function handleBuilderInstanceCreated(event: BuilderInstanceCreated): void {
  let address = event.params.new_contract_address;
  NFTContractTemplate.create(address);

  let nftContract = new NFTContract(address.toHexString());
  nftContract.name = fetchName(address);
  nftContract.symbol = fetchSymbol(address);
  nftContract.platform = "NiftyGateway";
  nftContract.save();
}

export function handleTransfer(event: Transfer): void {
  let id = `${event.address.toHexString()}/${event.params.id}`;
  let nft = NFT.load(id);
  if (nft == null) {
    nft = new NFT(id);
    nft.contract = event.address.toHexString();
    nft.tokenID = event.params.id;
    nft.creatorName = fetchCreatorName(event.address);
    nft.tokenURI = fetchTokenURI(event.address, event.params.id);
  }

  nft.owner = event.params.to;
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

function fetchCreatorName(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.nameOfCreator();
}

function fetchTokenURI(tokenAddress: Address, tokenId: BigInt): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.tokenURI(tokenId);
}
