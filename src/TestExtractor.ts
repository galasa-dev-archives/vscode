import * as vscode from 'vscode';
const path = require('path');

export class TestCase extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly pathToFile: string
	) {
		super(label);
    }
    
    iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'GalasaLogo.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'GalasaLogo.svg')
	};

}
