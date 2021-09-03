import * as dotenv from 'dotenv'

import * as TokenLibrary from './library/token.service';
import * as DocumentRepository from './library/document.repository';
import * as _ from 'underscore'

dotenv.config();

module.exports.putHandler = async (event:any, context:any, callback: any) => {

    console.log('event: ', event)

    const token = event['headers']['x-webmath-user-token']
    const documentName = decodeURI(event.documentName)

    console.log('documentName: ', documentName)

    let { email } = await TokenLibrary.getTokenInformation(token)

    if(!email || !documentName) {
        const response = {
            statusCode: 404
        }

        return callback(null, response)        
    }

    await DocumentRepository.addOrUpdateDocument(email, documentName, event.content, event.author, event.instructor, event.course)

    return callback(null, {
        statusCode: 200
    })

}

module.exports.getHandler = async (event:any, context:any, callback: any) => {
    const token = event['headers']['x-webmath-user-token'];
    const documentName = event.documentName
    const baseUri = '/documents';

    let { email } = await TokenLibrary.getTokenInformation(token)

    console.log('email!', email)

    if(email) {

        if(!documentName) {
            // get document here        
            let result = await DocumentRepository.getDocumentsForUser(email);

            let items = _.map(result, (rec) => {
                return { 'documentName' : rec.documentName, 'link': baseUri + `/${rec.documentName}`, 'author' : rec.author, 'instructor' : rec.instructor, 'course' : rec.course };
            })

            console.log('items: ', items)

            const response = {
                statusCode: 200,
                // TODO: just get documentName, and add href link to document
                body: JSON.stringify(items)
            }

            return callback(null, response)

        } else {

            console.log('getting document by name')
            let result = await DocumentRepository.getDocumentByName(email, decodeURI(documentName))

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

    console.log('email was empty')
    const response = {
        statusCode: 404
    }

    return callback(null, response)
} 
