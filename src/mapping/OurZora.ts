import { Transfer } from "../../generated/templates/NftContract/ERC721";
import { Nft, NftContract } from "../../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { OurZoraNFT as OurZora } from "../../generated/OurZora/OurZoraNFT";
import { OURZORA_NFT, ZERO_ADDRESS } from "../constants/index";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

export function handleTransferOurZora(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "OurZora";
    nftContract.save();
  }

  handleTransfer(event);

  let id = address + "/" + event.params.id.toString();
  let nft = Nft.load(id);
  if (nft.creatorAddress == null) {
    nft.creatorAddress = getAddressOfCreator(event.address, nft.tokenID);
    nft.nft.tokenURI = getTokenURI(event.address, nft.tokenID);
    nft.save();
  }
}

function getAddressOfCreator(address: Address, tokenId: BigInt): Address {
  if (address == OURZORA_NFT) {
    let contract = OurZora.bind(address);
    return contract.tokenCreators(tokenId);
  } else {
    log.warning("OurZora contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}

function getTokenURI(tokenID: BigInt, contractAddress: Address): Any {
    if (contractAddress == OURZORA_NFT) {
        let contract = OurZora.bind(contractAddress);
        return contract.tokenMetadataURI(tokenID);
    }
}