import { SignUpFormData } from "../login/sign-up-form-data"

export interface Comment{
    id : 0,
    datetime : Date | null,
    commentText : string | null,
    productId : bigint 
    user : SignUpFormData | null
}

