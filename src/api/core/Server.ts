import express from 'express';
import path from 'path';
import DiscordClient from '../../client/Client';
import Router from './Router';

export default class Server {
    router: Router;
    server: express.Application;

    constructor(protected client: DiscordClient) {
        this.router = new Router(client, this);
        this.router.loadRoutes(path.resolve(__dirname, '..', 'controllers')).then(() => console.log("Routes loaded")).catch(console.error);
        this.server = express();
    }

    run() {
        this.server.use(express.json(), express.urlencoded({ extended: true }));
        this.server.use(this.router.expressRouter);

        this.server.listen(process.env.PORT, () => {
            console.log('Server listening at port ' + process.env.PORT);
        });
    }
}