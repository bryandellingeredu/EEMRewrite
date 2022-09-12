import { Address } from "./address";
import { Coordinates } from "./coordinates";

export interface Location{
    address: Address
    coordinates: Coordinates
    displayName: string
    locationType: string
    locationUri: string
    uniqueId: string
    uniqueIdType: string
}