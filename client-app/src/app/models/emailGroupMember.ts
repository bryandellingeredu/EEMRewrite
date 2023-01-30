import { EmailGroup } from "./emailGroup";

export interface EmailGroupMember{
    id: string,
    email: string,
    displayName: string,
    emailGroups: EmailGroup[]
}