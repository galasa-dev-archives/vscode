import * as vscode from 'vscode';

export class RasItem extends vscode.TreeItem{
   

    constructor(public label: string,
                public directory: boolean,
                public children: any[] | undefined,
                public resultPath:string | undefined,
                public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState )
    }
}