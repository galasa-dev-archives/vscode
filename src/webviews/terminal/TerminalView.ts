import * as vscode from "vscode";
import * as zlib from "zlib";
import { TerminalImage } from "./TerminalImage";
import { TerminalSize } from "./TerminalSize";

export class TerminalView {
    private id:string | undefined;
    private run_id:string | undefined;
    private sequence:number | undefined;
    private images:TerminalImage[] | undefined;
    private defaultSize:TerminalSize | undefined;
    private showScreen:boolean | undefined;
    constructor(
        private readonly gzipBuffer:Buffer | undefined,
        private readonly json:JSON | undefined
    ) {
        this.setup();
        this.showTerminal();
    }

    setup() {
        let parsedFileJSON;
        if (this.gzipBuffer) {
            const unzippedFile = zlib.unzipSync(this.gzipBuffer);
            parsedFileJSON = JSON.parse(this.utf8ToString(unzippedFile.toJSON().data));
        }
        if (this.json) {
            parsedFileJSON = this.json;
        } 
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
            const panel = vscode.window.createWebviewPanel("terminalView", "Terminal " + this.run_id + " " + this.id, vscode.ViewColumn.Active);
            if (this.images) {
                panel.webview.html= this.getWebviewContent(this.images);
            } else {
                panel.webview.html= `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>No screens were found</title><body><h1>No screens were found</h1></body></html>`;
            }
        } else {
            vscode.window.showErrorMessage("The terminal you tried to open is formatted incorrectely.");
        }
    }   

    getWebviewContent(images: TerminalImage[]) : string {

        let completeHTML =  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Terminals</title><style>
        .main-grid-container {
          display: grid;
          grid-template-columns: auto;
          grid-template-rows: auto;
          font-family: Menlo, Monaco, "Courier New", monospace;  
        }
        
        body {
            white-space: pre;
        }
        h1, h3 {
            text-align: center;
        }
        .terminal {
            margin: auto;
            white-space: pre;
            overflow-wrap: normal;
            padding: 5px;
            border: 5px;
            border-style: double;
            width: 630px;
            height: 375px;
        }
        </style></head><body><h1>Terminal Screens of run: ${this.run_id}</h1><h3>Number of screens:  ${images.length}</h3><div class="main-grid-container">`;

        let dynamicHTML = "";
        
        images.forEach((image,index) => { 
            let standardCol:number = image.imageSize.columns;
            let standardRow:number = image.imageSize.rows;
            dynamicHTML = dynamicHTML + `<div class="terminal">`;
            let terminalHTML = "";
            for (let y = 0; y < standardRow; y++) {
                let terminalLine = "";
                for (let x = 0; x < standardCol; x++) {
                    let lineUsed:boolean = false;
                    image.fields.forEach((field) => {
                        if (x == field.column && y == field.row) {
                            field.contents.forEach(content => {
                                if (content.text) {
                                    terminalLine = terminalLine + " " + content.text;
                                    x = x + content.text.length;
                                    y = y + Math.floor(x / standardCol);
                                    x = x % standardCol;
                                    lineUsed = true;
                                } else if (content.chars && content.chars.length > 0) {
                                    let terminalCharLine = " ";
                                    content.chars.forEach(char => {
                                        if (char != null) {
                                            terminalCharLine = terminalCharLine + char;
                                        } else {
                                            terminalCharLine = terminalCharLine + " ";
                                        }
                                    });
                                    x = x + terminalCharLine.length;
                                    y = y + Math.floor(x / standardCol);
                                    x = x % standardCol;
                                    terminalLine = terminalLine + terminalCharLine;
                                    lineUsed = true;
                                }
                            });  
                        }
                    });
                    if (!lineUsed) {
                        terminalLine = terminalLine + " ";
                    }
                }
                terminalHTML = terminalHTML + terminalLine;
            }
            let broken = [];
            for(let i = 0; i < terminalHTML.length; i += standardCol) {
                broken.push(terminalHTML.substr(i, standardCol));
            }
            terminalHTML = broken.join("\n");
            dynamicHTML = dynamicHTML + terminalHTML + `</div>`;
        });
        dynamicHTML = dynamicHTML + `</div></body></html>`;
        completeHTML = completeHTML + dynamicHTML;

        return completeHTML;
    }

    private utf8ToString(array: number[]) : string {
        let str = "";
        array.forEach((item) => {
            str = str + String.fromCharCode(item);
        });
        return str;
    }
}