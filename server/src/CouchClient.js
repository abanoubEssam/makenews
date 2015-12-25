"use strict";

import HttpResponseHandler from "../../common/src/HttpResponseHandler.js";
import ApplicationConfig from "./config/ApplicationConfig.js";
import NodeErrorHandler from "./NodeErrorHandler.js";

import request from "request";

export default class CouchClient {
    static instance(dbName, accessToken) {
        return new CouchClient(dbName, accessToken);
    }

    constructor(dbName, accessToken) {
        this.dbName = dbName;
        this.accessToken = accessToken;
    }

    saveDocument(documentId, documentObj) {
        return new Promise((resolve, reject) => {
            request.put({
                "uri": ApplicationConfig.dbUrl() + "/" + this.dbName + "/" + documentId,
                "headers": {
                    "Cookie": "AuthSession=" + this.accessToken,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                "body": documentObj,
                "json": true
            },
                (error, response) => {
                    if(NodeErrorHandler.noError(error)) {
                        if(new HttpResponseHandler(response.statusCode).success()) {
                            resolve(response.body);
                        } else {
                            reject("unexpected response from the db");
                        }
                    } else {
                        reject(error);
                    }
                });
        });
    }

    static getAllDbs() {
        return new Promise((resolve, reject) => {
            request.get({
                "uri": ApplicationConfig.dbUrl() + "/_all_dbs"
            },
            (error, response) => {
                if(NodeErrorHandler.noError(error)) {
                    if(response.statusCode === HttpResponseHandler.codes.OK) {
                        let userDbs = JSON.parse(response.body).filter(dbName => {
                            if(dbName !== "_replicator" && dbName !== "_users") {
                                return dbName;
                            }
                        });
                        resolve(userDbs);
                    } else {
                        reject("unexpected response from the db");
                    }
                } else {
                    reject(error);
                }
            });
        });
    }
}
