
export interface Message {
    id : Number,
    text : string | null,
    fileUrl : string | null,
    fileName : string | null,
    type: string,
    time : string,
    senderId : Number
    recieverId : Number,
    userId : Number | null
}
