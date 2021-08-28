import * as dotenv from 'dotenv'
// import * as JwksRSA from 'jwks-rsa'
// import * as jwt from 'jsonwebtoken'
// import * as AWS from 'aws-sdk'

// import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// import { UserDocument } from './models/user-document';
// import { UserToken } from './models/user-token';
// import { SigningKey } from './models/signing-key';
// import { WebMathToken } from './models/web-math-token';

import * as TokenLibrary from './library/token.service';
import * as DocumentRepository from './library/document.repository';

dotenv.config();

// const documentClient:DocumentClient = new AWS.DynamoDB.DocumentClient()

// const jwksClient:JwksRSA.JwksClient = JwksRSA({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 10,
//     jwksUri: process.env.JWKS_URI
// })

module.exports.getHandler = async (event:any, context:any, callback: any) => {
    const token = event['headers']['x-webmath-user-token'];
    const documentName = event.documentName;

    let { email } = await TokenLibrary.getTokenInformation(token)

    if(email) {

        if(!documentName) {
            // get document here        
            let result = await DocumentRepository.getDocumentsForUser(email);
            const response = {
                statusCode: 200,
                body: JSON.stringify(result)
            }

            return callback(null, response)

        } else {

            let result = await DocumentRepository.getDocumentByName(email, documentName)

            if(!result) {
                const response = {
                    statusCode: 404,
                };

                return callback(null, response)
            }

            const response = {
                statusCode: 200,
                body: JSON.stringify(result)
            }

            return callback(null, response)

        }
    }

    const response = {
        statusCode: 404
    }

    return callback(null, response)
} 

// async function getSigningKey(client, kid):Promise<SigningKey> {
//     return new Promise((resolve, reject) => {
//         client.getSigningKey(kid, function (err, key) {
//             if(err) {
//                 reject(err)
//             } else {
//                 resolve(key)
//             }
//         });
//     });
// }

// async function getTokenInformation(token:string):Promise<UserToken> {
//     // 1. decode
//     // 2. validate token signature
//     // 3. profit!

//     let decodedToken = jwt.decode(token, { complete: true }) as WebMathToken;
//     if(!decodedToken) {
//         console.error('could not decode token - token is invalid')
//         return {}
//     }

//     let signingKey:SigningKey;
    
//     try {
//         signingKey = await getSigningKey(jwksClient, decodedToken.header.kid)
//     }
//     catch(e) {
//         console.error('failed to get signing key', e)
//         return {}
//     }

//     var publicKey = signingKey.publicKey || signingKey.rsaPublicKey;

//     // we have a signing key, so let's verify signature
//     let validatedPayload:jwt.JwtPayload;
//     try {
//         validatedPayload = await validateToken(token, publicKey);
//     }
//     catch(e) {
//         console.error('failed to validate token', e)
//         return {}
//     }

//     return validatedPayload as UserToken;
// }

// async function validateToken(token: string, signingKey: string):Promise<jwt.JwtPayload> {

//     return new Promise((resolve, reject) => {
//         jwt.verify(token, signingKey, { issuer: process.env.TOKEN_ISSUER, audience: process.env.CLIENT_ID },
//         function (err, decoded) {
//             if (err) {
//                 reject(err)
//             }
//             else {
//                 resolve(decoded);
//             }
//         });
//     });
// }

// async function getDocumentsForUser(userName: string): Promise<UserDocument[]> {

//     let lastEvaluatedKey = null;

//     let params:DocumentClient.QueryInput = {
//         TableName: "web-math-user-document",
//         KeyConditionExpression: "#userName = :userName",
//         ExpressionAttributeValues: {":userName": userName},
//         ExpressionAttributeNames: {
//             "#userName": "userName",
//         },
//         Limit: 1
//     }

//     let documents: UserDocument[] = []

//     do {
//         params.ExclusiveStartKey = lastEvaluatedKey;
//         let result = await documentClient.query(params).promise();
//         lastEvaluatedKey = result.LastEvaluatedKey;

//         documents = documents.concat(result.Items.map((item) => item as UserDocument));

//     } while(lastEvaluatedKey != null);
    
//     return documents;
// }


// async function getDocumentByName(userName: string, documentName: string): Promise<UserDocument> {

//     let params:DocumentClient.QueryInput = {
//         TableName: "web-math-user-document",
//         KeyConditionExpression: "#userName = :userName and #documentName = :documentName",
//         ExpressionAttributeValues: {":userName": userName, ":documentName" : documentName},
//         ExpressionAttributeNames: {
//             "#userName": "userName",
//             "#documentName": "documentName"
//         },
//     }

//     var queryResult = await documentClient.query(params).promise();
//     var items = queryResult.Items.map((item) => item as UserDocument);

//     return items ? items[0] : null;
// }
