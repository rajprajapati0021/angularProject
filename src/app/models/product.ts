import internal from "stream";
import { ApprovalStatusEnum } from "../enums/approval-status.enum";
import { SignUpFormData } from "../login/sign-up-form-data";
import { Like } from "./like";
import { Comment } from "./comment";

export interface Product {
    id : bigint,
    name : string,
    description : string,
    price : number,
    stock : bigint,
    imageUrl : string,
    IsAvailable : boolean,
    ApprovalStatusEnum : ApprovalStatusEnum,
    user : SignUpFormData,
    likes : Like[] | null,
    comments : Comment[] | null

}