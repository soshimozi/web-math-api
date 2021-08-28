import * as jwt from 'jsonwebtoken'
import * as JwksRSA from 'jwks-rsa'
import { SigningKey } from '../models/signing-key';
import { UserToken } from '../models/user-token';
import { WebMathToken } from '../models/web-math-token';

import * as dotenv from 'dotenv'
dotenv.config();

const jwksClient:JwksRSA.JwksClient = JwksRSA({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: process.env.JWKS_URI
})

async function getSigningKey(client, kid):Promise<SigningKey> {
    return new Promise((resolve, reject) => {
        client.getSigningKey(kid, function (err, key) {
            if(err) {
                reject(err)
            } else {
                resolve(key)
            }
        });
    });
}

export async function getTokenInformation(token:string):Promise<UserToken> {
    // 1. decode
    // 2. validate token signature
    // 3. profit!

    let decodedToken = jwt.decode(token, { complete: true }) as WebMathToken;
    if(!decodedToken) {
        console.error('could not decode token - token is invalid')
        return {}
    }

    let signingKey:SigningKey;
    
    try {
        signingKey = await getSigningKey(jwksClient, decodedToken.header.kid)
    }
    catch(e) {
        console.error('failed to get signing key', e)
        return {}
    }

    var publicKey = signingKey.publicKey || signingKey.rsaPublicKey;

    // we have a signing key, so let's verify signature
    let validatedPayload:jwt.JwtPayload;
    try {
        validatedPayload = await validateToken(token, publicKey);
    }
    catch(e) {
        console.error('failed to validate token', e)
        return {}
    }

    return validatedPayload as UserToken;
}

async function validateToken(token: string, signingKey: string):Promise<jwt.JwtPayload> {

    return new Promise((resolve, reject) => {
        jwt.verify(token, signingKey, { issuer: process.env.TOKEN_ISSUER, audience: process.env.CLIENT_ID },
        function (err, decoded) {
            if (err) {
                reject(err)
            }
            else {
                resolve(decoded);
            }
        });
    });
}
