export interface SigningKey {
    kid?: string,
    alg?: string,
    nbf?: string,
    publicKey?: string,
    rsaPublicKey?: string
}