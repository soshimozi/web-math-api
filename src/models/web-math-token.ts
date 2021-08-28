import { TokenHeader } from "./token-header";
import { UserToken } from "./user-token";

export interface WebMathToken {
    header?: TokenHeader,
    payload?: UserToken,
    signature?: string
}