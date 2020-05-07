import * as vscode from "vscode";
import * as fs from 'fs';
import * as zlib from "zlib";
import { TerminalImage } from "./TerminalImage";
import { TerminalSize } from "./TerminalSize";
import { TerminalField } from "./TerminalField";
import { FieldContents } from "./FieldContents";

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
        const parsedFileJSON = JSON.parse(this.utf8ToString(unzippedFile.toJSON().data));

        if (parsedFileJSON.id && parsedFileJSON.runId && parsedFileJSON.sequence && parsedFileJSON.images && parsedFileJSON.defaultSize) { 
            this.id = parsedFileJSON.id;
            this.run_id = parsedFileJSON.runId;
            this.sequence = parsedFileJSON.sequence;
            this.images = parsedFileJSON.images;
            this.defaultSize = parsedFileJSON.defaultSize;
            this.showScreen = true;

            console.log(this)
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

        let str =  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Terminals</title><style>
        .grid-container {
          display: grid;
          grid-template-columns: auto;
          grid-template-rows: auto;
          grid-gap: 1px;
          padding: 10px;
          white-space: pre;
          font-family: Menlo, Monaco, "Courier New", monospace
        }
        .terminal {
            white-space: pre; 
        }
        </style></head><body><h1>Terminal Screens of run: ${this.run_id}</h1><h3>Amount of screens:  ${this.images?.length}</h3><div class="grid-container">`

        let test = "";
        
        let indexArray: number[] = new Array(images?.length);
        let standardCol:number = 80;
        let standardRow:number = 24;

        images?.forEach((image,index) => { 
            test = test + `<div class="grid-container${index}">`
            indexArray.push(index)
            for (let y = 0; y < standardRow; y++) {
                let temp = ""
                for (let x = 0; x < standardCol; x++) {
                    image.fields.forEach((field) => {
                        if (x == field.column && y == field.row) {
                            if (field.contents[0].text) {
                                temp = temp + field.contents[0].text;
                            } else {
                                let tempy = ""
                                field.contents[0].chars?.forEach(char => {
                                    if (char == null) {
                                        tempy = tempy + " ";
                                    } else {
                                        tempy = tempy + char;
                                    }
                                });
                                temp = temp + tempy
                            }
                        }
                    });
                }
                console.log(temp);
                test = test + `<div class="terminal">${temp}</div>`;
            }
            test = test + `<br><br>`
            test = test + "</div>"
        })
        
        let str3 = `</div></body></html>`

        str = str + test  + str3

        return str;
    }

    


    private utf8ToString(array: number[]) : string {
        let str = "";
        array.forEach((item) => {
            str = str + String.fromCharCode(item);
        });
        return str;
    }

    private unpackImage(images: TerminalImage[] | undefined) : string {
        
        let appendable = "";
        images?.forEach((image,index) => {
            let col = image.cursorColumn;
            let row = image.cursorRow;
            let toAppend = image.fields.forEach((field:TerminalField) => {
                let col = field.column;
                let row = field.row;
            })
        });

        return appendable;
    }
}