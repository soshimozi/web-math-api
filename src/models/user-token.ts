export interface UserToken {
    email?: string,
    email_verified?: boolean,
    iss?: string,
    sub?: string,
    aud?: string,
    iat?: number,
    exp?: number,
    nonce?: string    
}