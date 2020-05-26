// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as ras from "galasa-ras-api"
// import { RasItem } from './RasItem';
// import { RemoteTestCase } from './RemoteTestExtractor';


// export class RemoteRASProvider implements vscode.TreeDataProvider<RasItem> {
//     private api:ras.DefaultApi;
//     private run:RemoteTestCase | undefined;

//     private _onDidChangeTreeData: vscode.EventEmitter<RasItem | undefined> = new vscode.EventEmitter<RasItem | undefined>();
//     readonly onDidChangeTreeData: vscode.Event<RasItem | undefined> = this._onDidChangeTreeData.event;

//     constructor(api: ras.DefaultApi) {
//         this.api = api;
//         this.run = undefined;
//     }

//     getTreeItem(element:RasItem): vscode.TreeItem {
//         return element;
//     }

//     async getChildren(element?: vscode.TreeItem): Promise<RasItem[] | undefined> {
//         let list: RasItem[] = [];
//         if (!this.run) {
//             return list;
//         }
//         if (this.api) {
//             if (!element) {
//                 const artifacts:any[] = this.run.data.artifactFiles
//                 artifacts.forEach((artifact:any) => {
//                     if (artifact.children) {
//                         list.push(new RasItem(artifact.name, true, artifact.children, undefined, vscode.TreeItemCollapsibleState.Collapsed, ""))  
//                     } else {
//                         list.push(new RasItem(artifact.name, false, undefined, artifact.content, vscode.TreeItemCollapsibleState.None, "rasitem"))
//                     }  
//                 });
//                 return list;
//             } else {
//                 if(element instanceof RasItem) {
//                     if (element.children) {
//                         element.children.forEach(child => {
//                             if (child.children) {
//                                 list.push(new RasItem(child.name, true, child.children, undefined, vscode.TreeItemCollapsibleState.Collapsed, ""))  
//                             } else {
//                                 list.push(new RasItem(child.name, false, undefined, child.content, vscode.TreeItemCollapsibleState.None, "rasitem"))
//                             }  
//                         })
//                         return list;
//                     } else {
//                         return undefined;
//                     }
//                 } else {
//                     return undefined;
//                 }
//             }
//         }
//     }

//     public refresh(): void {
//         this._onDidChangeTreeData.fire();
//     }

//     public setRun(run:RemoteTestCase) {
//         this.run = run;
//     }
// }

