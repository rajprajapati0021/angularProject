import { SignUpFormData } from "../login/sign-up-form-data";
import { Product } from "./product";

export interface Order {
    id : bigint,
    datetime : string,
    orderby : bigint,
    status : bigint,
    product : Product,
}
