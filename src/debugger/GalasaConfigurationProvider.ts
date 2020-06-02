import * as vscode from 'vscode';
import { EnvironmentProvider } from '../TreeViewEnvironmentProperties';
import { getDebugConfig } from '../DebugConfigHandler';

export class GalasaConfigurationProvider implements vscode.DebugConfigurationProvider {

    private galasaPath : string;
    private context : vscode.ExtensionContext;
    private environmentProvider : EnvironmentProvider;

    constructor(galasaPath : string, context : vscode.ExtensionContext, environmentProvider : EnvironmentProvider) {
        this.galasaPath = galasaPath;
        this.context = context
        this.environmentProvider = environmentProvider;
    }

    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {

		if (config.testclass) {
            this.runJavaDebugger(config);
        }

		return undefined;
    }
    
    async runJavaDebugger(config : vscode.DebugConfiguration) {
        vscode.debug.startDebugging(undefined, await getDebugConfig(config.testclass, this.galasaPath, this.context, this.environmentProvider, config.args, config.environment));
        
    }
}