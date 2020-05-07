import * as vscode from "vscode";
import * as fs from 'fs';
import * as zlib from "zlib";
import { TerminalImage } from "./TerminalImage";
import { TerminalSize } from "./TerminalSize";
import { TerminalField } from "./TerminalField";

export class TerminalView {
    private path:string | undefined;
    private id:string | undefined;
    private run_id:string | undefined;
    private sequence:number | undefined;
    private images:TerminalImage[] | undefined;
    private defaultSize:TerminalSize | undefined;
    private showScreen:boolean | undefined;
    constructor(
        private readonly pathToGZ:string

    ) {
        this.path = pathToGZ;
        this.setup();
        this.showTerminal();
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
            this.showScreen = true;
        } else {
            this.id = undefined;
            this.run_id = undefined;
            this.sequence = undefined;
            this.images = undefined;
            this.defaultSize = undefined;
            this.showScreen = false;
        }
    }

    showTerminal() {
        if (this.showScreen) {
            const panel = vscode.window.createWebviewPanel("terminalView", "Terminals", vscode.ViewColumn.Beside, {});
            panel.webview.html = this.getWebviewContent(this.images);
        } else {
            vscode.window.showErrorMessage("The terminal you tried to open is formatted incorrectely.")
        }
    }   

    getWebviewContent(images: TerminalImage[] | undefined) : string {

        let str =  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Terminals</title></head><body><ul>`
              
        let str2 = `</ul></body></html>`

        str = str + str2


        return str;
    }

    


    private utf8ToString(array: number[]) : string {
        let str = "";
        array.forEach((item) => {
            str = str + String.fromCharCode(item);
        });
        return str;
    }
}