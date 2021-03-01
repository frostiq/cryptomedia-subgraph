import { ERC1155, TransferSingle, URI } from "../generated/Rarible/ERC1155";
import { Nft } from "../generated/schema";
import { BIGINT_ZERO, ZERO_ADDRESS } from "./constants";
import { updateOwnership } from "./mapping";

export function handleTransferSingle(event: TransferSingle): void {
    let address = event.address.toHexString();

    let nftId = address + "/" + event.params._id.toString();
    let nft = Nft.load(nftId);
    if (nft == null) {
        let contract = ERC1155.bind(event.address);
        nft = new Nft(nftId);
        nft.contract = address;
        nft.tokenID = event.params._id;
        nft.creatorAddress = contract.creators(event.params._id);
        nft.tokenURI = contract.uri(event.params._id);
        nft.createdAt = event.block.timestamp;
        nft.save();
    }

    if (event.params._to == ZERO_ADDRESS) {
        // burn token
        nft.removedAt = event.block.timestamp;
        nft.save();
    }

    if (event.params._from != ZERO_ADDRESS) {
        updateOwnership(nftId, event.params._from, BIGINT_ZERO.minus(event.params._value));
    }
    updateOwnership(nftId, event.params._to, event.params._value);
}

export function handleURI(event: URI): void {
    let id = event.address.toHexString() + "/" + event.params._id.toString();
    let nft = new Nft(id);
    nft.tokenURI = event.params._value;
    nft.save();
}