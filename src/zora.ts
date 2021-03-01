import { Transfer } from "../generated/templates/NftContract/ERC721";
import { Nft, NftContract } from "../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { ZoraNFT as Zora } from "../generated/Zora/ZoraNFT";
import { ZORA_NFT, ZERO_ADDRESS } from "./constants";
import { Address, BigInt, log,  } from "@graphprotocol/graph-ts";


export function handleTransferZora(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "Zora";
    nftContract.save();
  }

  handleTransfer(event);

  let id = address + "/" + event.params.id.toString();
  let nft = Nft.load(id);
  if (nft.creatorAddress == null) {
    nft.creatorAddress = getAddressOfCreator(event.address, nft.tokenID);
    let zoraContract = Zora.bind(event.address)
    nft.tokenURI = zoraContract.tokenMetadataURI(nft.tokenID);
    nft.save();
  }
}

function getAddressOfCreator(address: Address, tokenId: BigInt): Address {
  if (address == ZORA_NFT) {
    let contract = Zora.bind(address);
    return contract.tokenCreators(tokenId);
  } else {
    log.warning("Zora contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}