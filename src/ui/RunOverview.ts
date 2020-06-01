import * as vscode from "vscode";
import { LocalRun } from "../TreeViewLocalResultArchiveStore";

export function showOverview(run : LocalRun) {
    const panel = vscode.window.createWebviewPanel("runOverview", "Overview - " + run.label, vscode.ViewColumn.Active);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
    table, th, td {
        border: 1px solid #D3D3D3;
    }
    table {
        width: 90%;
    }
    th, td {
        padding: 3px;
    }
    .side {
        padding: 1px;
        width: 100%;
    }
    @media only screen and (min-width: 1200px) {
        .parent {
            display: flex; justify-content: space-around;
        }
        .side {
            width: 50%;
        }
    }
    </style><title>Terminals</title></head><body><div class="parent">`;
    const endHtml = "</div></body></html>";

    const metaData = `<div class="side"><h3>Run ID: ${run.label.substring(0, run.label.indexOf(" - "))}</h3>
    <table>
    <tr><td>Run Name</td><td>${run.structure.runName}</td></tr>
    <tr><td>Bundle</td><td>${run.structure.bundle}</td></tr>
    <tr><td>Test Name</td><td>${run.structure.testName}</td></tr>
    <tr><td>Test Short Name</td><td>${run.structure.testShortName}</td></tr>
    <tr><td>Requestor</td><td>${run.structure.requestor}</td></tr>
    <tr><td>Status</td><td>${run.structure.status}</td></tr>
    <tr><td>Result</td><td>${run.structure.result}</td></tr>
    <tr><td>Queued</td><td>${run.structure.queued}</td></tr>
    <tr><td>Start Time</td><td>${run.structure.startTime}</td></tr>
    <tr><td>End Time</td><td>${run.structure.endTime}</td></tr></table><br><br></div>`;

    let methodData = `<div class="side"><h3>Methods: ${run.structure.methods.length}</h3>`;

    for(let i : number = 0; i < run.structure.methods.length; i++) {
        let befores = "";
        run.structure.methods[i].befores.forEach((before : any) => {
            befores = befores + ", " + before.methodName;
        });
        if(befores == "") {
            befores = "None";
        } else {
            befores = befores.substring(2);
        }

        let afters = "";
        run.structure.methods[i].afters.forEach((after : any) => {
            afters = afters + ", " + after.methodName;
        });
        if(afters == "") {
            afters = "None";
        } else {
            afters = afters.substring(2);
        }

        methodData = methodData + 
            `<table><tr><td>Method Name</td><td>${run.structure.methods[i].methodName}</td></tr>
            <tr><td>Class Name</td><td>${run.structure.methods[i].className}</td></tr>
            <tr><td>Type</td><td>${run.structure.methods[i].type}</td></tr>
            <tr><td>Befores</td><td>${befores}</td></tr>
            <tr><td>Afters</td><td>${afters}</td></tr>
            <tr><td>Status</td><td>${run.structure.methods[i].status}</td></tr>
            <tr><td>Result</td><td>${run.structure.methods[i].result}</td></tr>
            <tr><td>Run Log Start</td><td>${run.structure.methods[i].runLogStart}</td></tr>
            <tr><td>Run Log End</td><td>${run.structure.methods[i].runLogEnd}</td></tr>
            <tr><td>Start Time</td><td>${run.structure.methods[i].startTime}</td></tr>
            <tr><td>End Time</td><td>${run.structure.methods[i].endTime}</td></tr>
            </table><br>`;
    }
    methodData = methodData + `</div>`;

    panel.webview.html = html + metaData + methodData + endHtml;
}

