import { DefaultApi, RASRequest } from "galasa-web-api";
import { RasItem } from "./RasItem";
import * as vscode from 'vscode';
import { RemoteProvider } from "./RemoteProvider";
import { TerminalView } from "../ui/TerminalView";

export async function returnRemoteDocument(api: DefaultApi, rasitem:RasItem) {
    if (rasitem.resultPath) {
        const remoteOpenRequest:RASRequest = {resultPath: rasitem.resultPath};
        const responseBody = (await api.resultarchivePost(remoteOpenRequest)).body;
        let returnString = "";
        if (rasitem.resultPath.endsWith(".json")) {
            returnString = JSON.stringify(responseBody, undefined, 4);
        }else {
            returnString = responseBody.toString();
        }
        const provider = new RemoteProvider(rasitem.resultPath, returnString);
        

        vscode.workspace.registerTextDocumentContentProvider("remote", provider);

        let uri = vscode.Uri.parse('remote:' + rasitem.resultPath);
        let doc = await vscode.workspace.openTextDocument(uri);

        await vscode.window.showTextDocument(doc, { preview: false });
    }
}


export async function returnRemoteTerminal(api: DefaultApi, rasitem:RasItem){
    if (rasitem.resultPath) {
        const remoteOpenRequest:RASRequest = {resultPath: rasitem.resultPath};
        const responseBody:any = (await api.resultarchivePost(remoteOpenRequest)).body;
        new TerminalView(undefined, responseBody);
    }
}