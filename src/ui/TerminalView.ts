import * as vscode from "vscode";
import * as fs from "fs";
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
        } if (this.json) {
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
            panel.webview.html = this.getWebviewContent(this.images);
        } else {
            vscode.window.showErrorMessage("The terminal you tried to open is formatted incorrectely.");
        }
    }   

    getWebviewContent(images: TerminalImage[] | undefined) : string {

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
            width: 633px;
            height: 375px;
        }
        </style></head><body><h1>Terminal Screens of run: ${this.run_id}</h1><h3>Number of screens:  ${this.images?.length}</h3><div class="main-grid-container">`;

        let dynamicHTML = "";
        
        let indexArray: number[] = new Array(images?.length);
        let standardCol:number = 80;
        let standardRow:number = 24;

        images?.forEach((image,index) => { 
            dynamicHTML = dynamicHTML + `<div class="terminal">`;
            let terminalHTML = "";
            indexArray.push(index)
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
                                    y = y + Math.floor(x / 80);
                                    x = x % 80;
                                    lineUsed = true;
                                } else if (content.chars && content.chars.length > 0) {
                                    let terminalCharLine = " ";
                                    if (field.unformatted && field.unformatted == true) {
                                        terminalCharLine = "";
                                    }
                                    content.chars.forEach(char => {
                                        if (char != null) {
                                            terminalCharLine = terminalCharLine + char;
                                        } else {
                                            terminalCharLine = terminalCharLine + " ";
                                        }
                                    });
                                    x = x + terminalCharLine.length;
                                    y = y + Math.floor(x / 80);
                                    x = x % 80;
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
            for(let i = 0, len = terminalHTML.length; i < len; i += 80) {
                broken.push(terminalHTML.substr(i, 80));
            }
            terminalHTML = broken.join("\n");
            dynamicHTML = dynamicHTML + terminalHTML + `</div>`;
        })
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