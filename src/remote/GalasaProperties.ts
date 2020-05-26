// import * as fs from 'fs';
// import * as path from 'path';
// import * as vscode from 'vscode';
// import { RemoteProvider } from "./RemoteProvider";

// export class GalasaProperties {

//     private bootstrapUrl : string | undefined;
//     private trackedRuns : string;

//     constructor(bootstrap : string | undefined, galasaHome : string) {
//         this.bootstrapUrl = bootstrap;
//         if(!fs.existsSync(path.join(galasaHome, "vscodeTrackedRuns.txt"))) {
//             fs.writeFileSync(path.join(galasaHome, "vscodeTrackedRuns.txt"), "");
//         }
//         this.trackedRuns = path.join(galasaHome, "vscodeTrackedRuns.txt");
//     }

//     public getEndpointUrl() : string | undefined {
//         if(this.bootstrapUrl) {
//             return this.bootstrapUrl.substring(0, this.bootstrapUrl.indexOf("/bootstrap"));
//         }
//         return undefined;
//     }

//     public addRun(runName : string) {
//         if(fs.readFileSync(this.trackedRuns).toString().trim() == "") {
//             fs.appendFileSync(this.trackedRuns, runName);
//         } else {
//             fs.appendFileSync(this.trackedRuns, "," + runName);
//         }
//     }

//     public removeRun(runName : string) {
//         if(fs.readFileSync(this.trackedRuns).toString().trim() == runName) {
//             fs.writeFileSync(this.trackedRuns, "");
//         } else if (fs.readFileSync(this.trackedRuns).toString().indexOf(runName) == 0) {
//             fs.writeFileSync(this.trackedRuns, fs.readFileSync(this.trackedRuns).toString().replace(runName + ",", ""));
//         } else {
//             fs.writeFileSync(this.trackedRuns, fs.readFileSync(this.trackedRuns).toString().replace("," + runName, ""));
//         }
//     }

//     public getTrackedRuns() : string[] {
//         if(fs.readFileSync(this.trackedRuns).toString().trim() == "") {
//             return [];
//         }
//         return fs.readFileSync(this.trackedRuns).toString().trim().split(",");
//     }

//      async getLog(logFile:string, runName: string) {
//         let returnString = "";
//         returnString = logFile.toString();

//         const provider = new RemoteProvider(runName + ".log", returnString);
        

//         vscode.workspace.registerTextDocumentContentProvider("remote", provider);

//         let uri = vscode.Uri.parse('remote:' + runName+ ".log");
//         let doc = await vscode.workspace.openTextDocument(uri);

//         await vscode.window.showTextDocument(doc, { preview: false });
//     }
// }