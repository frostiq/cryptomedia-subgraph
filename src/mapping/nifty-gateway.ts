import { BuilderInstanceCreated } from "../../generated/NiftyGateway/NiftyGateway"
import { NiftyNFT } from "../../generated/templates/NftContract/NiftyNFT"
import { NftContract as NftContractTemplate } from "../../generated/templates"
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { Transfer } from "../../generated/templates/NftContract/ERC721";
import { NftContract, Nft } from "../../generated/schema"

export function handleBuilderInstanceCreated(event: BuilderInstanceCreated): void {
    let address = event.params.new_contract_address;
    NftContractTemplate.create(address);

    let nftContract = new NftContract(address.toHexString());
    nftContract.name = fetchName(address);
    nftContract.symbol = fetchSymbol(address);
    nftContract.platform = "NiftyGateway";
    nftContract.save();
}

export function handleTransferNiftyGateway(event: Transfer): void {
    handleTransfer(event)

    let id = event.address.toHexString() + "/" + event.params.id.toString();
    let nft = Nft.load(id);
    if (nft.creatorName == null) {
        let contract = NiftyNFT.bind(event.address);
        nft.creatorName = contract.nameOfCreator();
        nft.save();
    }
}

