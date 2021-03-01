import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ERC1155, TransferBatch, TransferSingle, URI } from "../generated/Rarible/ERC1155";
import { Nft } from "../generated/schema";
import { BIGINT_ZERO, ZERO_ADDRESS } from "./constants";
import { updateOwnership } from "./mapping";

export function handleTransferSingle(event: TransferSingle): void {
    transferBase(
        event.address,
        event.params._from,
        event.params._to,
        event.params._id,
        event.params._value,
        event.block.timestamp
    );
}

export function handleTransferBatch(event: TransferBatch): void {
    if (event.params._ids.length != event.params._values.length) {
        throw new Error("Inconsistent arrays length in TransferBatch");
    }

    for (let i = 0; i < event.params._ids.length; i++) {
        transferBase(
            event.address,
            event.params._from,
            event.params._to,
            event.params._ids[i],
            event.params._values[i],
            event.block.timestamp
        );
    }
}

export function handleURI(event: URI): void {
    let id = event.address.toHexString() + "/" + event.params._id.toString();
    let nft = new Nft(id);
    nft.tokenURI = event.params._value;
    nft.save();
}

function transferBase(contractAddress: Address, from: Address, to: Address, id: BigInt, value: BigInt, timestamp: BigInt): void {
    let nftId = contractAddress + "/" + id.toString();
    let nft = Nft.load(nftId);
    if (nft == null) {
        let contract = ERC1155.bind(contractAddress);
        nft = new Nft(nftId);
        nft.contract = contractAddress.toHexString();
        nft.tokenID = id;
        nft.creatorAddress = contract.creators(id);
        nft.tokenURI = contract.uri(id);
        nft.createdAt = timestamp;
        nft.save();
    }

    if (to == ZERO_ADDRESS) {
        // burn token
        nft.removedAt = timestamp;
        nft.save();
    }

    if (from != ZERO_ADDRESS) {
        updateOwnership(nftId, from, BIGINT_ZERO.minus(value));
    }
    updateOwnership(nftId, to, value);
}