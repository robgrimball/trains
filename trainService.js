import { once } from 'events';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { Place } from './place.js';

export const NO_SUCH_ROUTE_MESSAGE = 'NO SUCH ROUTE';
export const ERROR_INVALID_MEASURE_TYPE = "Invalid Measure Type, must be S for Stops or D for Distance.";
export const ERROR_INVALID_MIN_MAX_BOUNDS = "Invalid min-max bounds for trip.";
export const ERROR_INVALID_COMMAND = "Invalid command.";

const MEASURE_STOPS = 's';
const MEASURE_DISTANCE = 'd';
const ROUTE_LINE_SEPARATORS = /[, ]+/;
const COMMAND_SEPARATORS = /[- ]+/;
const COMMAND_DIST = 'dist';
const COMMAND_TRIPS = 'trips';
const COMMAND_SHORT = 'short';

export class TrainService {
    routeMap = new Map();

    addOrGetPlace(name) {
        let place;
        if (!this.routeMap.has(name)) {
            place = new Place(name);
            this.routeMap.set(name, place);
        } else {
            place = this.routeMap.get(name);
        }
        return place;
    }

    parseRoute(line) {
        let originName = line.charAt(0);
        let destinationName = line.charAt(1);
        let origin;
        let distance = parseInt(line.slice(2), 10);

        origin = this.addOrGetPlace(originName);
        this.addOrGetPlace(destinationName);
        origin.addPath(destinationName, distance);
    }

    parseRouteLine(line) {
        let route;
        let routes = line.split(ROUTE_LINE_SEPARATORS);

        for (route of routes) {
            this.parseRoute(route);
        }
    }

    async loadRoutes(fileName) {
        try {
            let rl = createInterface({
                input: createReadStream(fileName),
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                this.parseRouteLine(line);
            });

            await once(rl, 'close');
        } catch (err) {
            console.error(err);
        }
    }

    parseCommandLine(line) {
        let route = line.split(COMMAND_SEPARATORS);

        switch (route[0].toLowerCase()) {
            case COMMAND_DIST:
                return this.routeDistance(route.slice(1));
            case COMMAND_TRIPS:
                return this.numberOfTrips(route[1], route[2], route[3], route[4], route[5]);
            case COMMAND_SHORT:
                return this.shortestTrip(route[1], route[2], new Set());
            default:
                throw new Error(ERROR_INVALID_COMMAND);
        }
    }

    async loadAndExecuteCommands(filename) {
        let commandCounter = 0;
        try {
            let rl = createInterface({
                input: createReadStream(filename),
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                let result;

                result = this.parseCommandLine(line);
                if (result !== undefined) {
                    commandCounter++;
                    console.log(`Output #${commandCounter}: ${result}`);
                }
            })

            await once(rl, 'close');
        } catch (err) {
            console.error(err);
        }
    }

    routeDistance(trip) {
        let origin;
        let distanceToHop;
        let i;
        let distance = 0;
        for (i=0; i<trip.length-1; i++) {
            origin = this.routeMap.get(trip[i]);
            distanceToHop = origin.paths.get(trip[i+1]);
            if (distanceToHop === undefined) {
                return NO_SUCH_ROUTE_MESSAGE;
            }
            distance += distanceToHop;
        }
        return distance;
    }

    shortestTrip(originName, destinationName, visitedSet, tripLength = 0) {
        let origin = this.routeMap.get(originName);
        let destinationTime = origin.paths.get(destinationName);
        let shortestPath = undefined;
        let path;
        let newVisitedSet = new Set(visitedSet);

        if (destinationTime !== undefined) {
            shortestPath = destinationTime;
        }

        for (const [key, value] of origin.paths.entries()) {
            if (key !== destinationName) {
                if (!newVisitedSet.has(key)) {
                    newVisitedSet.add(key);
                    path = this.shortestTrip(key, destinationName, newVisitedSet, value);
                }
                if (path !== undefined && ((shortestPath === undefined) || (shortestPath > path))) {
                    shortestPath = path;
                }
            }
        }
        if (shortestPath !== undefined) {
            return shortestPath + tripLength;
        }
    }

    numberOfTrips(originName, destinationName, min, max, measure, amount = 0) {
        let origin = this.routeMap.get(originName);
        let count = 0;
        let additive;

        if ((min === undefined) || (max === undefined) || (min < 0) || (max < min)) {
            throw new Error(ERROR_INVALID_MIN_MAX_BOUNDS);
        }

        for (const [key, value] of origin.paths.entries()) {
            if (measure.toLowerCase() === MEASURE_STOPS) {
                additive = 1;
            } else if (measure.toLowerCase() === MEASURE_DISTANCE) {
                additive = value;
            } else {
                throw new Error(ERROR_INVALID_MEASURE_TYPE);
            }

            if (key === destinationName) {
                if ((amount+additive >= min) && (amount+additive <= max)) {
                    count++;
                }
            }
            if (amount + additive <= max) {
                count += this.numberOfTrips(key, destinationName, min, max, measure, amount + additive);
            }
        }

        return count;
    }
}