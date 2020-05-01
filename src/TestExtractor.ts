import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

export class TestExtractor implements vscode.TreeDataProvider<TestCase> {

    private _onDidChangeTreeData: vscode.EventEmitter<TestCase | undefined> = new vscode.EventEmitter<TestCase | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TestCase | undefined> = this._onDidChangeTreeData.event;

    constructor() {
    }
    
    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: TestCase): vscode.TreeItem {
		return element;
	}

    getChildren(element?: any): vscode.ProviderResult<any[]> {
        return this.getWorkspaceTests();
    }

    async getWorkspaceTests() : Promise<TestCase[]> {
        const javaFiles = await vscode.workspace.findFiles("**/*.java");
        let testFiles : TestCase[] = [];
        javaFiles.forEach(file => {
            let fileName = file.toString().substring(7);
            if(fileName.includes("%40")) {
                fileName = fileName.replace("%40","@");
            }
            const data = fs.readFileSync(fileName).toString();
            if(data.includes("@Test") && data.includes("import dev.galasa.Test;")) {
                var name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf(".java"));
                testFiles.push(new TestCase(name));
            }
        })
        return testFiles;
    }
}

export class TestCase extends vscode.TreeItem {

    constructor(
		public readonly label: string,
	) {
		super(label);
    }
    
    iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'GalasaLogo.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'GalasaLogo.svg')
	};

}
