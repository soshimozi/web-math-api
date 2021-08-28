import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserDocument } from "../models/user-document";

import * as AWS from 'aws-sdk'
const documentClient:DocumentClient = new AWS.DynamoDB.DocumentClient()

export async function getDocumentsForUser(userName: string): Promise<UserDocument[]> {

    let lastEvaluatedKey = null;

    let params:DocumentClient.QueryInput = {
        TableName: "web-math-user-document",
        KeyConditionExpression: "#userName = :userName",
        ExpressionAttributeValues: {":userName": userName},
        ExpressionAttributeNames: {
            "#userName": "userName",
        },
        Limit: 1
    }

    let documents: UserDocument[] = []

    do {
        params.ExclusiveStartKey = lastEvaluatedKey;
        let result = await documentClient.query(params).promise();
        lastEvaluatedKey = result.LastEvaluatedKey;

        documents = documents.concat(result.Items.map((item) => item as UserDocument));

    } while(lastEvaluatedKey != null);
    
    return documents;
}


export async function getDocumentByName(userName: string, documentName: string): Promise<UserDocument> {

    let params:DocumentClient.QueryInput = {
        TableName: "web-math-user-document",
        KeyConditionExpression: "#userName = :userName and #documentName = :documentName",
        ExpressionAttributeValues: {":userName": userName, ":documentName" : documentName},
        ExpressionAttributeNames: {
            "#userName": "userName",
            "#documentName": "documentName"
        },
    }

    var queryResult = await documentClient.query(params).promise();
    var items = queryResult.Items.map((item) => item as UserDocument);

    return items ? items[0] : null;
}