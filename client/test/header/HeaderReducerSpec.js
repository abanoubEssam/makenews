import { currentHeaderTab, popUp } from "../../src/js/header/HeaderReducer";
import { expect } from "chai";

describe("Header Reducer", () => {
    it("should return action with type and actions of scan news ", () => {
        expect(currentHeaderTab()).to.equals("Scan News");
    });

    it("should return action with type and actions of write a story ", () => {
        let action = { "type": "Write a Story", "currentHeaderTab": "Write a Story" };
        expect(currentHeaderTab({}, action)).to.equals("Write a Story");
    });

    describe("popup", () => {
        const message = "message";
        const callback = () => {};
        const action = { "type": "POP_UP", message, callback };

        expect(popUp({}, action)).to.deep.equals({ message, callback });
    });
});
