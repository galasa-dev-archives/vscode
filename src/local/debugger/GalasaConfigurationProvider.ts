import * as vscode from 'vscode';
import { EnvironmentProvider } from '../views/TreeViewEnvironmentProperties';
import { getDebugConfig, GherkinTestCase } from './DebugConfigHandler';

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

		if (config.testclass || config.gherkinFeature) {
            this.runJavaDebugger(config);
        }

		return undefined;
    }
    
    async runJavaDebugger(config: vscode.DebugConfiguration) {
        if (config.testclass) {
            vscode.debug.startDebugging(undefined, await getDebugConfig(config.testclass, this.galasaPath, this.context, this.environmentProvider, config.args, config.environment));
        } else {
            const gherkin = new GherkinTestCase("", vscode.Uri.parse(config.gherkinFeature));
            vscode.debug.startDebugging(undefined, await getDebugConfig(gherkin, this.galasaPath, this.context, this.environmentProvider, config.args, config.environment));
        }
    }
}