import {
  OwnershipTransferred as OwnershipTransferredEvent,
  PredictionMarketCreated as PredictionMarketCreatedEvent
} from "../generated/PredictionMarketFactoryV3/PredictionMarketFactoryV3"
import {
  OwnershipTransferred,
  PredictionMarketCreated
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePredictionMarketCreated(
  event: PredictionMarketCreatedEvent
): void {
  let entity = new PredictionMarketCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketAddress = event.params.marketAddress
  entity.numberOfOptions = event.params.numberOfOptions
  entity.eventHash = event.params.eventHash
  entity.expirationTime = event.params.expirationTime
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
