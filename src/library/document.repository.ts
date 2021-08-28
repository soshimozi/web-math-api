import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserDocument } from "../models/user-document";

import * as AWS from 'aws-sdk'
const documentClient:DocumentClient = new AWS.DynamoDB.DocumentClient()

export async function addDocument(userName: string, documentName: string, content: string) {
    
    console.log('userName', userName)
    console.log('documentName', documentName)
    console.log('content', content)

    var params = {
        TableName: 'web-math-user-document',
        Key: { userName : userName, documentName: documentName },        
        UpdateExpression: 'set #content = :content',
        ConditionExpression: "#userName = :userName and #documentName = :documentName",
        ExpressionAttributeValues: {":userName": userName, ":documentName" : documentName, ":content": content},
        ExpressionAttributeNames: {
            "#userName": "userName",
            "#documentName": "documentName",
            "#content": "documentContent"
        },
      };
      

    //   let params = {
    //     TableName: 'web-math-user-document',
    //     Key: {
    //         documentName: documentName,
    //         userName: userName
    //     },
    //     Item: {userName:userName, documentName:documentName, documentContent:content}
    // }


      console.log('about to update!')
      let result:any = await documentClient.update(params).promise();
      console.log('result: ', result)
}

export async function addOrUpdateDocument(userName: string, documentName: string, content: string) {
    
    console.log('userName', userName)
    console.log('documentName', documentName)
    console.log('content', content)

    // var params = {
    //     TableName: 'web-math-user-document',
    //     Key: { userName : userName, documentName: documentName },        
    //     UpdateExpression: 'set #content = :content',
    //     ConditionExpression: "#userName = :userName and #documentName = :documentName",
    //     ExpressionAttributeValues: {":userName": userName, ":documentName" : documentName, ":content": content},
    //     ExpressionAttributeNames: {
    //         "#userName": "userName",
    //         "#documentName": "documentName",
    //         "#content": "documentContent"
    //     },
    //   };
      

      let params = {
        TableName: 'web-math-user-document',
        Key: {
            documentName: documentName,
            userName: userName
        },
        Item: {userName:userName, documentName:documentName, documentContent:content}
    }


      console.log('about to update!')
      let result:any = await documentClient.put(params).promise();
      console.log('result: ', result)
}

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