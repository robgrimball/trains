import { TrainService} from './trainService.js';

let trainService = new TrainService();

await trainService.loadRoutes('routes.txt');
await trainService.loadAndExecuteCommands('commands.txt');
