import * as vscode from "vscode";
import { LocalRun } from "../TreeViewLocalResultArchiveStore";

export function showOverview(run : LocalRun) {
    const panel = vscode.window.createWebviewPanel("runOverview", "Overview - " + run.label, vscode.ViewColumn.Active);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminals</title><style></style>
    </head><body><h1>Run ID: ${run.label.substring(0, run.label.indexOf(" - "))}</h1>`;
    const endHtml = "</body></html>";

    const midHtml = `<table style="width:50%">
    <tr><td>Run Name</td><td>${run.structure.runName}</td></tr>
    <tr><td>Bundle</td><td>${run.structure.bundle}</td></tr>
    <tr><td>Test Name</td><td>${run.structure.testName}</td></tr>
    <tr><td>Test Short Name</td><td>${run.structure.testShortName}</td></tr>
    <tr><td>Requestor</td><td>${run.structure.requestor}</td></tr>
    <tr><td>Status</td><td>${run.structure.status}</td></tr>
    <tr><td>Result</td><td>${run.structure.result}</td></tr>
    <tr><td>Queued</td><td>${run.structure.queued}</td></tr>
    <tr><td>Start Time</td><td>${run.structure.startTime}</td></tr>
    <tr><td>End Time</td><td>${run.structure.endTime}</td></tr>`;

    panel.webview.html = html + midHtml + endHtml;
}

