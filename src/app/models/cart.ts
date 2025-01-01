import { SignUpFormData } from "../login/sign-up-form-data";
import { Product } from "./product";

export interface Cart {
    id : bigint,
    datetime : string,
    product : Product,
    user : SignUpFormData
}
