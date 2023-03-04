export interface SearchFormValues{
    title: string
    description: string
    start : Date | null
    end : Date | null
    categoryIds: string[]
    location: string
    actionOfficer: string
    organizationId: string 
  }