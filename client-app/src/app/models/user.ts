export interface User{
    userName: string;
    displayName: string;
    token: string;
    image?: string
    roles?: string[]
    studentType: string
}

export interface UserFormValues{
    email: string;
    password: string;
    displayName?: string;
    userName?: string;
    roles?: string[]
}