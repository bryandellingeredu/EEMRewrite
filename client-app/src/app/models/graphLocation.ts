import { GraphAddress } from "./graphAddress";
import { GraphCoordinates } from "./graphCoordinates";

export interface GraphLocation{
    address: GraphAddress
    coordinates: GraphCoordinates
    displayName: string
    locationType: string
    locationUri: string
    uniqueId: string
    uniqueIdType: string
}