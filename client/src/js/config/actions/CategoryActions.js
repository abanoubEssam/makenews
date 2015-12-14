/* eslint no-unused-vars:0, max-params:1 */

"use strict";
import CategoriesApplicationQueries from "../db/CategoriesApplicationQueries.js";
import CategoryDb from "../db/CategoryDb.js";
import { CategoryDocument, STATUS_INVALID, STATUS_VALID } from "./CategoryDocuments.js";
import AjaxClient from "../../utils/AjaxClient";
import { displayAllCategoriesAsync } from "./AllCategoriesActions.js";
import RssDb from "../../rss/RssDb.js";
import FacebookRequestHandler from "../../facebook/FacebookRequestHandler.js";
import EnvironmentConfig from "../../EnvironmentConfig.js";
import FacebookDb from "../../facebook/FacebookDb.js";

export const DISPLAY_CATEGORY = "DISPLAY_CATEGORY";
export const DEFAULT_CATEGORY = "Default Category";

export const RSS_TYPE = "rss";
export const FACEBOOK_TYPE = "facebook";
export const TWITTER_TYPE = "twitter";

export function populateCategoryDetailsAsync(categoryId) {
    return dispatch => {
        CategoriesApplicationQueries.fetchSourceUrlsObj(categoryId).then(sourceUrlsObj => {
            dispatch(populateCategoryDetails(sourceUrlsObj));
        }).catch((error) => {
            dispatch(populateCategoryDetails(null));
        });
    };
}

export function populateCategoryDetails(sourceUrlsObj) {
    return { "type": DISPLAY_CATEGORY, sourceUrlsObj };
}

export function addRssUrlAsync(categoryId, url, callback) {
    return dispatch => {
        AjaxClient.instance("/rss-feeds").get({ "url": url }).then((responseFeed) => {
            addUrlDocument(dispatch, categoryId, RSS_TYPE, url, STATUS_VALID).then(documentId => {
                RssDb.addRssFeeds(documentId, responseFeed.items);
                callback(STATUS_VALID);
            }).catch(error => {
                callback(STATUS_INVALID);
            });
        }).catch(() => {
            addUrlDocument(dispatch, categoryId, RSS_TYPE, url, STATUS_INVALID);
            callback(STATUS_INVALID);
        });
    };
}

export function addFacebookUrlAsync(categoryId, url, callback) {
    return dispatch => {
        addUrlDocument(dispatch, categoryId, FACEBOOK_TYPE, url, STATUS_VALID).then(documentId => {
            FacebookRequestHandler.getPosts(documentId, EnvironmentConfig.instance().get("facebookAccessToken"), url).then((postDocuments)=> {
                FacebookDb.addFacebookFeeds(postDocuments);
            });
            callback(STATUS_VALID);
        }).catch(error => {
            callback(STATUS_INVALID);
        });
    };
}

function addUrlDocument(dispatch, categoryId, title, url, status, responseFeed) {
    CategoriesApplicationQueries.addUrlConfiguration(categoryId, title, url, status).then(response => {
        CategoriesApplicationQueries.addRssFeeds(response.id, responseFeed);
        dispatch(populateCategoryDetailsAsync(categoryId));
    });
}

export function addTwitterUrlAsync(categoryId, url, callback) {
    return dispatch => {
        AjaxClient.instance("/twitter-feeds").get({ "url": url }).then((responseFeed) => {
            addTwitterUrlDocument(dispatch, categoryId, url, STATUS_VALID, responseFeed.statuses);
            callback(STATUS_VALID);
        }).catch(() => {
            addTwitterUrlDocument(dispatch, categoryId, url, STATUS_INVALID);
            callback(STATUS_INVALID);
        });
    };
}

function addTwitterUrlDocument(dispatch, categoryId, url, status, responseFeed) {
    CategoriesApplicationQueries.addTwitterUrlConfiguration(categoryId, url, status).then(response => {
        if(responseFeed && responseFeed.length !== 0) {
            CategoriesApplicationQueries.addTwitterFeeds(response.id, responseFeed);
        }
        dispatch(populateCategoryDetailsAsync(categoryId));
    });
}

export function createDefaultCategory(categoryName = DEFAULT_CATEGORY) {
    return dispatch => {
        let newCategoryDocument = CategoryDocument.getNewCategoryDocument(categoryName);
        CategoryDb.createCategoryIfNotExists(newCategoryDocument).then(success => {
            dispatch(displayAllCategoriesAsync());
        }).catch(error => {
            dispatch(displayAllCategoriesAsync());
        });
    };
}

export function createCategory(categoryName = "", callback = ()=> {}) {
    return dispatch => {
        if(categoryName) {
            dispatchCreateCategory(categoryName);
        } else {
            generateCategoryName().then((name) => {
                dispatchCreateCategory(name);
            });
        }
    };

    function dispatchCreateCategory(categoryName1) {
        CategoryDb.createCategory(CategoryDocument.getNewCategoryDocument(categoryName1)).then(response => {
            response.name = categoryName1;
            callback(response);
        }).catch(error => {
            callback(error);
        });
    }
}

export function updateCategoryName(categoryName = "", categoryId = "", callback = ()=> {}) {
    return dispatch => {

        CategoryDb.isCategoryExists(categoryName, categoryId).then((response)=> {
            if(response.status) {
                return callback({ "status": false });
            }
            updateCategoryNameHelper(categoryName, categoryId).then((updateResponse)=> {
                callback(updateResponse);
            }).catch((error)=> {
                callback(error);
            });
        }).catch((error)=> {
            callback(error);
        });
    };
}

function updateCategoryNameHelper(categoryName, categoryId) {
    return new Promise((resolve, reject) => {
        CategoryDb.getCategoryById(categoryId).then((response)=> {
            if (response.status) {

                let categoryDoc = response.category;
                categoryDoc.name = categoryName;

                CategoryDb.updateCategory(categoryDoc).then(()=> {
                    resolve({ "status": true });
                }).catch((error)=> {
                    reject(error);
                });
            } else {
                resolve(response);
            }
        }).catch((error)=> {
            reject(error);
        });
    });
}

function generateCategoryName() {
    return new Promise((resolve, reject) => {
        let generatedName = "";
        CategoryDb.fetchAllCategoryDocuments().then(categories => {
            let existingNames = categories.map(category => category.name);
            let existingNamesSize = existingNames.length + 1;
            Array(existingNamesSize).fill().map((value, index) => index).some((index)=> {
                generatedName = "Untitled Category " + (index + 1);
                let NEGATIVE_INDEX = -1;
                if(existingNames.indexOf(generatedName) === NEGATIVE_INDEX) {
                    resolve(generatedName);
                    return true;
                }
            });
        });
    });
}
