import { ConfigureSourcesPage } from "./../../../src/js/config/components/ConfigureSourcesPage";
import FacebookLogin from "./../../../src/js/facebook/FacebookLogin";
import React from "react";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";
import { findAllWithType } from "react-shallow-testutils";
import * as SourceConfigActions from "./../../../src/js/sourceConfig/actions/SourceConfigurationActions";
import ConfiguredSources from "./../../../src/js/config/components/ConfiguredSources";
import ConfigurePane from "./../../../src/js/config/components/ConfigurePane";
import { expect } from "chai";

describe("ConfigureSourcesPage", () => {
    let ZERO = 0, ONE = 1;
    describe("switchSourceTab", () => {
        let sandbox = null, renderer = null;

        beforeEach("switchSourceTab", () => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(FacebookLogin, "instance").returns({});
            renderer = TestUtils.createRenderer();
            /* we have to render it twice inorder to trigger componentwillreviceprops because of shallow rendering*/ // eslint-disable-line
            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "bla" }} dispatch={()=>{}} />
            );
        });

        afterEach("switchSourceTab", () => {
            sandbox.restore();
        });

        it("should dispatch switchSourceTab with WEB if configure sourceType is not in the desired list", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("WEB");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "something" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });

        it("should dispatch switchSourceTab with TWITTER if configure sourceType is twitter", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("TWITTER");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "twitter" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });

        it("should dispatch switchSourceTab with WEB if configure sourceType is web", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("WEB");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "web" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });

        it("should dispatch switchSourceTab with PROFILES if configure sourceType is facebook and subType is not the desired one", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("Profiles");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook", "sourceSubType": "something" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });

        it("should dispatch switchSourceTab with PROFILES if configure sourceType is profiles", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("Profiles");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook", "sourceSubType": "profiles" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });

        it("should dispatch switchSourceTab with PAGES, getSources with PAGES and keyword if configure sourceType is pages", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("Pages");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook", "sourceSubType": "pages" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });

        it("should dispatch switchSourceTab with GROUPS and getSources with GROUPS and keyword if configure sourceType is groups", () => {
            let switchTabsMock = sandbox.mock(SourceConfigActions)
                .expects("switchSourceTab").withArgs("Groups");
            let clearSourceMock = sandbox.mock(SourceConfigActions)
                .expects("clearSources");

            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook", "sourceSubType": "groups" }} dispatch={()=>{}}/>
            );

            clearSourceMock.verify();
            switchTabsMock.verify();
        });
    });

    describe("children", () => {
        let renderer = TestUtils.createRenderer();
        let result = null, sandbox = null;

        beforeEach("children", () => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(FacebookLogin, "instance").returns({});
        });

        afterEach("children", () => {
            sandbox.restore();
        });

        it("should have ConfiguredSources component", () => {
            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook" }} dispatch={()=>{}}/>);
            result = renderer.getRenderOutput();
            let configuredSources = findAllWithType(result, ConfiguredSources);
            expect(configuredSources).to.have.lengthOf(ONE);
        });

        it("should have ConfigurePage component", () => {
            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook" }} dispatch={()=>{}}/>);
            result = renderer.getRenderOutput();
            let configurePane = findAllWithType(result, ConfigurePane);
            expect(configurePane).to.have.lengthOf(ONE);
        });

        it("should not have ConfiguredSources component if sourceType is facebook and expireTime is ZERO", () => {
            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "facebook" }} dispatch={()=>{}} expireTime={ZERO}/>);
            result = renderer.getRenderOutput();
            let configuredSources = findAllWithType(result, ConfiguredSources);
            expect(configuredSources).to.have.lengthOf(ZERO);
        });


        it("should not have ConfiguredSources component if sourceType is twitter and twitterAuthenticated is False", () => {
            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "twitter" }} dispatch={()=>{}} twitterAuthenticated={false}/>);
            result = renderer.getRenderOutput();
            let configuredSources = findAllWithType(result, ConfiguredSources);
            expect(configuredSources).to.have.lengthOf(ZERO);
        });

        it("should have ConfiguredSources component if sourceType is twitter and twitterAuthenticated is true", () => {
            renderer = TestUtils.createRenderer();
            renderer.render(
                <ConfigureSourcesPage store={{}} params={{ "sourceType": "twitter" }} dispatch={()=>{}} twitterAuthenticated={true}/>); //eslint-disable-line
            result = renderer.getRenderOutput();
            let configuredSources = findAllWithType(result, ConfigurePane);
            expect(configuredSources).to.have.lengthOf(ONE);
        });
    });
});
