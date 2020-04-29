import * as vscode from 'vscode';
const path = require('path');
const fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('galasa.addEntry', () => {
        vscode.debug.startDebugging(undefined, "Galasa Debug");
    });
    vscode.commands.registerCommand('galasa.bootjar', config => {
        return context.extensionPath + "/lib/galasa-boot.jar";
    });
    vscode.commands.registerCommand('galasa.localmaven', config => {
        return "";
    });
    vscode.commands.registerCommand('galasa.remotemaven', config => {
        return "--remotemaven https://nexus.galasa.dev/repository/maven-nightly/";
    });
    vscode.commands.registerCommand('galasa.version', config => {
        return "0.7.0-SNAPSHOT";
    });
    vscode.commands.registerCommand('galasa.specifyTestClass', config => {
        const active = vscode.window.activeTextEditor;
        if(active) {
            let text = active.document.getText();
            let packageStart = text.substring(text.indexOf("package"));
            let packageName = packageStart.substring(8, packageStart.indexOf(';'));
            let testName = active.document.fileName.substring(active.document.fileName.lastIndexOf('/') + 1, active.document.fileName.lastIndexOf('.java'));
            return packageName + "/" + packageName + "." + testName;
        }
    });
}