import * as vscode from "vscode";
import * as fs from 'fs';
import * as zlib from "zlib";

export class TerminalView {
    private path:string | undefined;
    private id:string | undefined;
    private run_id:string | undefined;
    private sequence:number | undefined;
    private images:Object[] | undefined;
    private defaultSize:Object | undefined;
    constructor(
        private readonly pathToGZ:string

    ) {
        this.path = pathToGZ;
        this.setup();
    }

    setup() {
        const gzipFile = fs.readFileSync(this.pathToGZ);
        const unzippedFile = zlib.unzipSync(gzipFile);
        const parsedFileJSON = JSON.parse(this.utf8ToString(unzippedFile.toJSON().data))

        if (parsedFileJSON.id && parsedFileJSON.runId && parsedFileJSON.sequence && parsedFileJSON.images && parsedFileJSON.defaultSize) { 
            this.id = parsedFileJSON.id;
            this.run_id = parsedFileJSON.runId;
            this.sequence = parsedFileJSON.sequence;
            this.images = parsedFileJSON.images;
            this.defaultSize = parsedFileJSON.defaultSize;

            console.log(this);

            const panel = vscode.window.createWebviewPanel("terminalView", "Terminals", vscode.ViewColumn.Beside, {});
            panel.webview.html = this.getWebviewContent();
        } else {
            this.id = undefined;
            this.run_id = undefined;
            this.sequence = undefined;
            this.images = undefined;
            this.defaultSize = undefined;
            vscode.window.showErrorMessage("The terminal you tried to open is formatted incorrectely.")
        }
    }

    getWebviewContent() : string {
        return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cat Coding</title>
      </head>
      <body>
          <img src="https://media.giphy.com/media/5i7umUqAOYYEw/giphy.gif" width="300" />
      </body>
      </html>`;
      }


    private utf8ToString(array: number[]) : string {
        let str = "";
        array.forEach((item) => {
            str = str + String.fromCharCode(item);
        });
        return str;
    }
}