import {
    TrainService,
    NO_SUCH_ROUTE_MESSAGE,
    ERROR_INVALID_MEASURE_TYPE,
    ERROR_INVALID_MIN_MAX_BOUNDS, ERROR_INVALID_COMMAND
} from "../trainService.js";
import {assert, expect} from "chai";

describe('TrainService', function() {
    describe('addOrGetPlace', function() {
        it('add new place', function() {
            let trainService = new TrainService();
            let place;
            place = trainService.addOrGetPlace('A');
            expect(place.name).to.equal('A');
        });
        it('get an existing place', function() {
            let trainService = new TrainService();
            let place;
            trainService.addOrGetPlace('A');
            place = trainService.addOrGetPlace('A');
            expect(place.name).to.equal('A');
            expect(trainService.routeMap.size).to.equal(1);
        });
    });

    describe('parseRoute', function() {
        it('adds a route', function() {
            let trainService = new TrainService();
            trainService.parseRoute('AB5');
            expect(trainService.routeMap.get('A').paths.get('B')).to.equal(5);
            expect(trainService.routeMap.size).to.equal(2);
        });
        it('adds multiple routes', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5, BD3,AD2 CB20');
            expect(trainService.routeMap.get('A').paths.get('B')).to.equal(5);
            expect(trainService.routeMap.get('B').paths.get('D')).to.equal(3);
            expect(trainService.routeMap.get('A').paths.get('D')).to.equal(2);
            expect(trainService.routeMap.get('C').paths.get('B')).to.equal(20);
            expect(trainService.routeMap.size).to.equal(4);
        });
    });

    describe('routeDistance', function() {
        it('gets distance for route', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5,BC3,CD9');
            expect(trainService.routeDistance(['A', 'B', 'C', 'D'])).to.equal(17);
        });
        it('gets NO SUCH ROUTE for route', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5,BC3,CD9');
            expect(trainService.routeDistance(['A', 'C', 'D'])).to.equal(NO_SUCH_ROUTE_MESSAGE);
        });
        it('gets 0 distance for one hop route', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5,BC3,CD9');
            expect(trainService.routeDistance(['A'])).to.equal(0);
        });
    });

    describe('shortestTrip', function() {
        it('should get shortest trip - 7', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.shortestTrip('A', 'C', new Set())).to.equal(7);
        });
        it('should get shortest trip - 12', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.shortestTrip('A', 'D', new Set())).to.equal(12);
        });
        it('should get shortest trip - undefined', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.shortestTrip('C', 'A', new Set())).to.equal(undefined);
        });
    });

    describe('numberOfTrips', function() {
        it('should error with invalid measure', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            assert.throw(function() {
                trainService.numberOfTrips('A', 'C', 0, 4, 'X');
            }, Error, ERROR_INVALID_MEASURE_TYPE);
        });
        it('should error with invalid bounds - min undefined', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            assert.throw(function() {
                trainService.numberOfTrips('A', 'C', undefined, 4, 'S');
            }, Error, ERROR_INVALID_MIN_MAX_BOUNDS);
        });
        it('should error with invalid bounds - max undefined', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            assert.throw(function() {
                trainService.numberOfTrips('A', 'C', 0, undefined, 'S');
            }, Error, ERROR_INVALID_MIN_MAX_BOUNDS);
        });
        it('should error with invalid bounds - min < 0', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            assert.throw(function() {
                trainService.numberOfTrips('A', 'C', -1, 4, 'S');
            }, Error, ERROR_INVALID_MIN_MAX_BOUNDS);
        });
        it('should error with invalid bounds - min > max', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            assert.throw(function() {
                trainService.numberOfTrips('A', 'C', 5, 4, 'S');
            }, Error, ERROR_INVALID_MIN_MAX_BOUNDS);
        });
        it('should give number of trips with stops less than 5', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            let trips = trainService.numberOfTrips('A', 'C', 0, 4, 'S');
            expect(trips).to.equal(7);
        })
        it('should give number of trips with distance less than 9', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            let trips = trainService.numberOfTrips('A', 'C', 0, 8, 'D');
            expect(trips).to.equal(2);
        })
        it('should give number of trips with distance of exactly 8', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC2 AE6');
            let trips = trainService.numberOfTrips('A', 'C', 8, 8, 'D');
            expect(trips).to.equal(2);
        })
        it('should give number of trips with distance of exactly than 0', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC0 CD4 DE2 CE5 EC2 AE6');
            let trips = trainService.numberOfTrips('A', 'C', 0, 0, 'D');
            expect(trips).to.equal(1);
        })
        it('should give number of trips with distance exactly than 8', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC3 CD4 DE2 CE5 EC2 AE6');
            let trips = trainService.numberOfTrips('A', 'C', 0, 0, 'D');
            expect(trips).to.equal(0);
        })
    });

    describe('parseCommandLine', function() {
        it('should error with invalid command', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            assert.throw(function() {
                trainService.parseCommandLine('blah A C 1 4 S');
            }, Error, ERROR_INVALID_COMMAND);
        });
        it('should get distance from A-C', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.parseCommandLine('dist A-C')).to.equal(8);
        });
        it('should get num of trips from A-C with dist of 8', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.parseCommandLine('trips A C 8 8 D')).to.equal(1);
        });
        it('should get num of trips from A-C with 1 stop', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.parseCommandLine('trips A C 1 1 S')).to.equal(1);
        });
        it('should get shortest distance from A-C', function() {
            let trainService = new TrainService();
            trainService.parseRouteLine('AB5 BC4 AC8 CD4 DE2 CE5 EC1 AE6');
            expect(trainService.parseCommandLine('short A C')).to.equal(7);
        })
    })
});
