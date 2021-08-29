import * as dotenv from 'dotenv'

import * as TokenLibrary from './library/token.service';
import * as DocumentRepository from './library/document.repository';

dotenv.config();

module.exports.putHandler = async (event:any, context:any, callback: any) => {

    console.log('event: ', event)

    const token = event['headers']['x-webmath-user-token']
    const documentName = event.documentName

    let { email } = await TokenLibrary.getTokenInformation(token)

    if(!email || !documentName) {
        const response = {
            statusCode: 404
        }

        return callback(null, response)        
    }

    await DocumentRepository.addOrUpdateDocument(email, documentName, event.content)

    return callback(null, {
        statusCode: 200
    })

}

module.exports.getHandler = async (event:any, context:any, callback: any) => {
    const token = event['headers']['x-webmath-user-token'];
    const documentName = event.documentName;

    let { email } = await TokenLibrary.getTokenInformation(token)

    console.log('email!', email)

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
