export const INVALID_PLACE_NAME = 'Invalid place name.';
export const INVALID_PATH_DISTANCE = 'Invalid path distance.';

export class Place {
    name;
    paths = new Map();

    constructor(placeName) {
        this.name = this.checkPlaceName(placeName);
    }

    checkPlaceName(placeName) {
        if (!(placeName.length === 1 && placeName.match(/[a-z]/i))) {
            throw new Error(INVALID_PLACE_NAME);
        }
        return placeName.toUpperCase();
    }

    checkDistance(distance) {
        if (isNaN(distance) || distance < 0) {
            throw new Error(INVALID_PATH_DISTANCE);
        }
        return distance;
    }

    addPath(placeName, distance) {
        this.paths.set(this.checkPlaceName(placeName), this.checkDistance(distance));
    }
}