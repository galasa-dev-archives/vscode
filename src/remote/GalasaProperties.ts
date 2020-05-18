import * as fs from 'fs';
import * as path from 'path';

export class GalasaProperties {

    private bootstrapUrl : string | undefined;
    private trackedRuns : string;

    constructor(bootstrap : string | undefined, galasaHome : string) {
        this.bootstrapUrl = bootstrap;
        if(!fs.existsSync(path.join(galasaHome, "vscodeTrackedRuns.txt"))) {
            fs.writeFileSync(path.join(galasaHome, "vscodeTrackedRuns.txt"), "");
        }
        this.trackedRuns = path.join(galasaHome, "vscodeTrackedRuns.txt");
    }

    public getEndpointUrl() : string | undefined {
        if(this.bootstrapUrl) {
            return this.bootstrapUrl.substring(0, this.bootstrapUrl.indexOf("/bootstrap"));
        }
        return undefined;
    }

    public addRun(runName : string) {
        if(fs.readFileSync(this.trackedRuns).toString() == "") {
            fs.appendFileSync(this.trackedRuns, runName);
        } else {
            fs.appendFileSync(this.trackedRuns, "," + runName);
        }
    }

    public removeRun(runName : string) {
        if(fs.readFileSync(this.trackedRuns).toString() == runName) {
            fs.writeFileSync(this.trackedRuns, "");
        } else if (fs.readFileSync(this.trackedRuns).toString().indexOf(runName) == 0) {
            fs.writeFileSync(this.trackedRuns, fs.readFileSync(this.trackedRuns).toString().replace(runName + ",", ""));
        } else {
            fs.writeFileSync(this.trackedRuns, fs.readFileSync(this.trackedRuns).toString().replace("," + runName, ""));
        }
    }

    public getTrackedRuns() : string[] {
        let data = fs.readFileSync(this.trackedRuns).toString().split(",");
        for (let index = 0; index < data.length; index++) {
            data[index] = data[index].trim();
        }
        return data;
    }
}