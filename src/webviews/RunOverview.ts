import * as vscode from "vscode";
import { LocalRun } from "../local/views/TreeViewLocalResultArchiveStore";

export function showOverview(run : LocalRun) {
    let buttonColour = "";
    let buttonBack = "0,0,0";
    switch(vscode.window.activeColorTheme.kind) {
        case vscode.ColorThemeKind.Dark: buttonColour = "#f2f2f2"; buttonBack = "200, 200, 200"; break;
        case vscode.ColorThemeKind.Light: buttonColour = "#0d0d0d"; break;
        case vscode.ColorThemeKind.HighContrast: buttonColour = "#0080ff"; break;
    }
    const panel = vscode.window.createWebviewPanel("runOverview", "Overview - " + run.label, vscode.ViewColumn.Active, {enableScripts: true});
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

    /* Style the button that is used to open and close the collapsible content */
    button {
      color: ${buttonColour};
      background: rgba(${buttonBack},0.1);
      cursor: pointer;
      width: 100%;
      border: none;
      outline: none;
    }
    
    /* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
    .active, .collapsible:hover {
        background: rgba(${buttonBack},0.2);
    }
    
    /* Style the collapsible content. Note: hidden by default */
    .content {
      display: none;
      overflow: hidden;
    } 
    </style><title>Terminals</title></head><body><div class="parent">`;
    const endHtml = `</div></body><script>
    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.parentElement.parentElement.parentElement.lastElementChild.lastElementChild.lastElementChild
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    } 
    </script></html>`;

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

    let methods: any;
    let type: string = "";
    if (run.structure.methods) {
        methods = run.structure.methods;
        type = "java";
    } else if (run.structure.gherkinMethods) { 
        methods = run.structure.gherkinMethods;
        type = "gherkin";
    }
    let methodData = `<div class="side"><h3>Methods: ${methods.length}</h3>`;

    for(let i : number = 0; i < methods.length; i++) {
        let befores = "";
        let afters = "";
        if (methods[i].type == "Test") {
            methods[i].befores.forEach((before : any) => {
                befores = befores + ", " + before.methodName;
            });
            if(befores == "") {
                befores = "None";
            } else {
                befores = befores.substring(2);
            }

            methods[i].afters.forEach((after : any) => {
                afters = afters + ", " + after.methodName;
            });
            if(afters == "") {
                afters = "None";
            } else {
                afters = afters.substring(2);
            }
        }
        

        let exception = methods[i].exception;

        if (type == "java") {
            methodData = methodData +
                `<table><tr><td>Method Name</td><td>${methods[i].methodName}</td></tr>
            <tr><td>Class Name</td><td>${methods[i].className}</td></tr>
            <tr><td>Type</td><td>${methods[i].type}</td></tr>`;

            if (methods[i].type == "Test") {
                methodData = methodData + `<tr><td>Befores</td><td>${befores}</td></tr>
                <tr><td>Afters</td><td>${afters}</td></tr>`
            }

            methodData = methodData +  `<tr><td>Status</td><td>${methods[i].status}</td></tr>
            <tr><td>Result</td><td>${methods[i].result}</td></tr>
            <tr><td>Run Log Start</td><td>${methods[i].runLogStart}</td></tr>
            <tr><td>Run Log End</td><td>${methods[i].runLogEnd}</td></tr>
            <tr><td>Start Time</td><td>${methods[i].startTime}</td></tr>
            <tr><td>End Time</td><td>${methods[i].endTime}</td></tr>`
        } else if (type == "gherkin") { 
            methodData = methodData +
                `<table><tr><td>Method Name</td><td>${methods[i].name}</td></tr>
                <tr><td>Test Name</td><td>${methods[i].testName}</td></tr>`;
            
            methodData = methodData +  `<tr><td>Status</td><td>${methods[i].status}</td></tr>
                <tr><td>Result</td><td>${methods[i].result.name}</td></tr>
                <tr><td>Start Time</td><td>${methods[i].startTime}</td></tr>
                <tr><td>End Time</td><td>${methods[i].endTime}</td></tr>`
        }

        if(exception) {
            methodData = methodData + `<tr><td colspan="2"><button type="button" class="collapsible">Exception</button></td></tr>
                <tr><td colspan="2"><div class="content">${exception}</div></td></tr>`;
        }
        
        methodData = methodData + `</table><br>`;
            
    }
    methodData = methodData + `</div>`;
    console.log(html + metaData + methodData + endHtml);
    panel.webview.html = html + metaData + methodData + endHtml;
}

