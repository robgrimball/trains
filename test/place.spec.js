import {INVALID_PATH_DISTANCE, INVALID_PLACE_NAME, Place} from "../place.js";
import {expect, assert} from "chai";

describe('Place', function() {
    it('creates a place', function() {
        let place = new Place('a');
        expect('A').to.equal(place.name);
    });
    it('fails to create a place - bad name', function() {
        assert.throw(function() {
            new Place('5');
        }, Error, INVALID_PLACE_NAME);
    });
    it('adds a path to a place', function() {
        let place = new Place('a');
        place.addPath('b', 5);
        expect(5).to.equal(place.paths.get('B'));
    });
    it('fails to add path to a place - letter distance', function() {
        assert.throw(function() {
            let place = new Place('A');
            place.addPath('B', 'X');
        }, Error, INVALID_PATH_DISTANCE);
    });
    it('fails to add path to a place - negative distance', function() {
        assert.throw(function() {
            let place = new Place('A');
            place.addPath('B', '-5');
        }, Error, INVALID_PATH_DISTANCE);
    });
});
