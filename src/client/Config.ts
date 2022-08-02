import { readFile, writeFile } from "fs";
import path from "path";

export default class Config {
    props: {
        [key: string]: any;
    };

    constructor() {
        this.props = {};
        this.load();
    }

    load() {
        readFile(path.resolve(__dirname, '..', '..', 'database', 'config.json'), (err, data) => {
            if (err) {
                console.log(err);                
            }

            this.props = JSON.parse(data.toString());
        });
    }

    get(key: string) {
        return this.props[key];
    }

    set(key: string, value: any) {
        this.props[key] = value;
    }

    write() {
        writeFile(path.resolve(__dirname, '..', '..', 'database', 'config.json'), JSON.stringify(this.props), () => null);
    }
};