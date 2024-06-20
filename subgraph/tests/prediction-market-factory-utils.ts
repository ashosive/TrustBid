import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  PredictionMarketCreated
} from "../generated/PredictionMarketFactory/PredictionMarketFactory"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPredictionMarketCreatedEvent(
  marketAddress: Address,
  numberOfOptions: i32,
  eventHash: Bytes,
  startTime: BigInt,
  expirationTime: BigInt,
  owner: Address
): PredictionMarketCreated {
  let predictionMarketCreatedEvent = changetype<PredictionMarketCreated>(
    newMockEvent()
  )

  predictionMarketCreatedEvent.parameters = new Array()

  predictionMarketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "marketAddress",
      ethereum.Value.fromAddress(marketAddress)
    )
  )
  predictionMarketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "numberOfOptions",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(numberOfOptions))
    )
  )
  predictionMarketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "eventHash",
      ethereum.Value.fromFixedBytes(eventHash)
    )
  )
  predictionMarketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  predictionMarketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "expirationTime",
      ethereum.Value.fromUnsignedBigInt(expirationTime)
    )
  )
  predictionMarketCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return predictionMarketCreatedEvent
}
