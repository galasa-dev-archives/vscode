import * as vscode from 'vscode';
import * as fs from 'fs';
import { DefaultApi } from "galasa-web-api";
import { RasItem } from './RasItem';


export class RemoteRASProvider implements vscode.TreeDataProvider<RasItem> {
    private api:DefaultApi;

    private _onDidChangeTreeData: vscode.EventEmitter<RasItem | undefined> = new vscode.EventEmitter<RasItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<RasItem | undefined> = this._onDidChangeTreeData.event;

    constructor(api: DefaultApi) {
        this.api = api;
    }

    getTreeItem(element:RasItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<RasItem[] | undefined> {
        let list: RasItem[] = [];
        if (this.api) {
            if (!element) {
                const responseBody:any =  (await this.api.resultarchiveGet()).body;
                const rasServices = responseBody.rasServices;
                rasServices.forEach((rasService:any) => {
                    const temp = rasService.structure;
                    list.push(new RasItem(temp.name, temp.directory, temp.children, temp.resultPath, vscode.TreeItemCollapsibleState.Collapsed))
                });
                return list;
            } else {
                if(element instanceof RasItem) {
                    element.children?.forEach(child=> {
                        if (!child.directory) {
                            list.push(new RasItem(child.name, false, undefined, child.resultPath, vscode.TreeItemCollapsibleState.None))
                        } else { 
                            list.push(new RasItem(child.name, true, child.children, undefined, vscode.TreeItemCollapsibleState.Collapsed));
                        } 
                    });
                    return list;
                } else {
                    return undefined;
                }
            }
        }
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

