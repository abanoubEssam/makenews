import * as FBActions from "../../src/js/config/actions/FacebookConfigureActions";
import { expect } from "chai";
import AjaxClient from "../../src/js/utils/AjaxClient";
import sinon from "sinon";
import LoginPage from "../../src/js/login/pages/LoginPage";
import "../helper/TestHelper";
import UserSession from "../../src/js/user/UserSession";
import mockStore from "../helper/ActionHelper";
import AppWindow from "../../src/js/utils/AppWindow";
import HttpResponseHandler from "../../../common/src/HttpResponseHandler";
import nock from "nock";

describe("Facebook Configure Actions", () => {
    describe("fetch facebook sources", () => {
        it("should return type FACEBOOK_GOT_SOURCES action", () => {
            let sources = [{ "name": "Profile1" }, { "name": "Profile2" }];
            let facebookConfigureAction = { "type": FBActions.FACEBOOK_GOT_SOURCES, "sources": sources };
            expect(facebookConfigureAction).to.deep.equal(FBActions.facebookSourcesReceived(sources));
        });
    });

    describe("switch current Tab", () => {
        it("should return the FACEBOOK_CHANGE_CURRENT_TAB action", () => {
            let currentTab = "Profiles";
            let facebookSourceTabSwitch = FBActions.facebookSourceTabSwitch(currentTab);
            expect(facebookSourceTabSwitch.type).to.equal(FBActions.FACEBOOK_CHANGE_CURRENT_TAB);
            expect(facebookSourceTabSwitch.currentTab).to.equal(currentTab);
        });
    });

    describe("get Sources of", () => {
        let sandbox = null, ajaxClient = null, ajaxClientGetMock = null, userName = null;

        beforeEach("get Sources of", () => {
            userName = "user";
            sandbox = sinon.sandbox.create();
            sandbox.mock(UserSession).expects("instance").returns({
                "continueSessionIfActive": () => {}
            });
            sandbox.mock(LoginPage).expects("getUserName").returns(userName);
        });

        afterEach("get Sources of", () => {
            sandbox.restore();
        });

        it("should dispatch FACEBOOK_GOT_SOURCES action after getting fb profiles ", (done) => {
            let serverUrl = "/facebook-sources";
            let sources = { "data": [{ "name": "testProfile" }, { "name": "testProfile2" }] };

            ajaxClient = AjaxClient.instance(serverUrl, false);
            sandbox.mock(AjaxClient).expects("instance").withArgs(serverUrl, false).returns(ajaxClient);
            ajaxClientGetMock = sandbox.mock(ajaxClient).expects("get");
            ajaxClientGetMock.withArgs({ "userName": userName, "keyword": "testProfile", "type": "profile" }).returns(Promise.resolve(sources));

            let actions = [{ "type": "FACEBOOK_CHANGE_CURRENT_TAB", "currentTab": "Profiles" }, { "type": "FACEBOOK_GOT_SOURCES", "sources": sources.data }];
            let store = mockStore({ "configuredSources": { "profiles": [] } }, actions, done);
            store.dispatch(FBActions.getSourcesOf(FBActions.PROFILES, "testProfile"));
        });

        it("fetch pages when requested source type is pages", (done) => {
            let serverUrl = "/facebook-sources";
            let pageName = "testPage";
            let sources = { "data": [{ "name": "testProfile" }, { "name": "testProfile2" }] };

            ajaxClient = AjaxClient.instance(serverUrl, false);
            sandbox.mock(AjaxClient).expects("instance").withArgs(serverUrl, false).returns(ajaxClient);
            ajaxClientGetMock = sandbox.mock(ajaxClient).expects("get").withArgs({ "userName": userName, "keyword": pageName, "type": "page" });
            ajaxClientGetMock.returns(Promise.resolve(sources));

            let actions = [{ "type": "FACEBOOK_CHANGE_CURRENT_TAB", "currentTab": FBActions.PAGES }, { "type": "FACEBOOK_GOT_SOURCES", "sources": sources.data }];
            let store = mockStore(() => ({ "configuredSources": { "pages": [] } }), actions, done);
            store.dispatch(FBActions.getSourcesOf(FBActions.PAGES, pageName));
        });

        it("should dispatch configured pages with added property", (done) => {
            let serverUrl = "/facebook-sources";
            let pageName = "testPage";
            let fbResponse = { "data": [{ "id": 1, "name": "testProfile" },
                { "id": 2, "name": "testProfile2" }] };
            let sources = { "data": [{ "id": 1, "name": "testProfile", "added": true },
                { "id": 2, "name": "testProfile2" }] };

            ajaxClient = AjaxClient.instance(serverUrl, false);
            sandbox.mock(AjaxClient).expects("instance").withArgs(serverUrl, false).returns(ajaxClient);
            ajaxClientGetMock = sandbox.mock(ajaxClient).expects("get").withArgs({ "userName": userName, "keyword": pageName, "type": "page" });
            ajaxClientGetMock.returns(Promise.resolve(fbResponse));
            let actions = [{ "type": "FACEBOOK_CHANGE_CURRENT_TAB", "currentTab": FBActions.PAGES }, { "type": "FACEBOOK_GOT_SOURCES", "sources": sources.data }];
            let store = mockStore(() => ({ "configuredSources": { "pages": [{ "_id": 1 }, { "_id": 3 }] } }), actions, done);
            store.dispatch(FBActions.getSourcesOf(FBActions.PAGES, pageName));
        });
    });
    
    describe("add source to configred list", () => {
        let sandbox = null;

        beforeEach("add source to configred list", () => {
            sandbox = sinon.sandbox.create();
        });

        afterEach("add source to configred list", () => {
            sandbox.restore();
        });
        
        it(`should dispatch ${FBActions.FACEBOOK_ADD_PROFILE} when requested for adding profile`, (done) => {
            let source = { "name": "something", "id": "id_" };

            let appWindow = new AppWindow();
            sandbox.mock(AppWindow).expects("instance").returns(appWindow);
            sandbox.stub(appWindow, "get").withArgs("serverUrl").returns("http://localhost");

            sandbox.mock(UserSession).expects("instance").returns({
                "continueSessionIfActive": () => {}
            });

            nock("http://localhost")
                .put("/facebook/configureSource")
                .reply(HttpResponseHandler.codes.OK, { "ok": true });

            let store = mockStore({}, [{ "type": FBActions.FACEBOOK_ADD_PROFILE, "source": source }], done);
            store.dispatch(FBActions.addSourceToConfigureListOf(FBActions.PROFILES, source));
        });

        it(`should dispatch ${FBActions.FACEBOOK_ADD_PAGE} when requested for adding page`, (done) => {
            let source = { "name": "something", "id": "id_" };

            let appWindow = new AppWindow();
            sandbox.mock(AppWindow).expects("instance").returns(appWindow);
            sandbox.stub(appWindow, "get").withArgs("serverUrl").returns("http://localhost");

            sandbox.mock(UserSession).expects("instance").returns({
                "continueSessionIfActive": () => {}
            });

            nock("http://localhost")
                .put("/facebook/configureSource")
                .reply(HttpResponseHandler.codes.OK, { "ok": true });

            let store = mockStore({}, [{ "type": FBActions.FACEBOOK_ADD_PAGE, "source": source }], done);
            store.dispatch(FBActions.addSourceToConfigureListOf(FBActions.PAGES, source));
        });

        it(`should dispatch ${FBActions.FACEBOOK_ADD_GROUP} when requested for adding group`, (done) => {
            let source = { "name": "something", "id": "id_" };

            let appWindow = new AppWindow();
            sandbox.mock(AppWindow).expects("instance").returns(appWindow);
            sandbox.stub(appWindow, "get").withArgs("serverUrl").returns("http://localhost");

            sandbox.mock(UserSession).expects("instance").returns({
                "continueSessionIfActive": () => {}
            });

            nock("http://localhost")
                .put("/facebook/configureSource")
                .reply(HttpResponseHandler.codes.OK, { "ok": true });

            let store = mockStore({}, [{ "type": FBActions.FACEBOOK_ADD_GROUP, "source": source }], done);
            store.dispatch(FBActions.addSourceToConfigureListOf(FBActions.GROUPS, source));
        });

        it(`should dispatch ${FBActions.FACEBOOK_ADD_PROFILE} by default`, () => {
            let event = FBActions.addSourceToConfigureListOf("", { "name": "something" });
            expect(event.type).to.equal(FBActions.FACEBOOK_ADD_PROFILE);
            expect(event.source).to.deep.equal({ "name": "something" });
        });
    });
});