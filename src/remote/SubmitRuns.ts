import * as cps from "galasa-cps-api";
import * as runs from "galasa-runs-api";
import { window, workspace } from "vscode";
import { findTestArtifact } from "../DebugConfigHandler";
import { TestCase } from "../TestExtractor";
import { readFileSync, createReadStream } from "fs";
import { GalasaProperties } from "./GalasaProperties";

export async function submitRuns(cpsApi : cps.DefaultApi, runsApi: runs.DefaultApi, testClass : TestCase, props : GalasaProperties) : Promise<number | undefined> {

    const testStreamResponse : any = (await cpsApi.cpsNamespaceGet("framework", "test", "streams")).body;

    const testStreamResponses : string = testStreamResponse.value;
    const testStreams : string[] = testStreamResponses.split(",");

    const testStream = await window.showQuickPick(testStreams, {placeHolder : "Name of test stream"});
    if(!testStream) {
        return;
    }
    else if(!testStreams.includes(testStream)) {
        window.showErrorMessage("Invalid Test Stream: " + testStream);
        return;
    }

    const obrResponse : any = (await cpsApi.cpsNamespaceGet("framework", "test.stream", "obr", [testStream])).body;
    const obr = obrResponse.value;

    if(!obr) {
        window.showErrorMessage("Invalid Obr for test stream: " + testStream);
        return;
    }

    const mavenRepoResponse : any = (await cpsApi.cpsNamespaceGet("framework", "test.stream", "maven.repo", [testStream])).body;
    const mavenRepo = mavenRepoResponse.value;

    if(!mavenRepo) {
        window.showErrorMessage("Invalid maven repo for test stream: " + testStream);
        return;
    }

    const propertiesFiles = await workspace.findFiles("**/*.properties");
    let fileNames : any[] = [""];
    propertiesFiles.forEach(file => {
        fileNames.push(file.path);
    });
    const overridesFile = await window.showQuickPick(fileNames, {placeHolder : "Overrides File"});

    let overrides = undefined;
    if(overridesFile == undefined) {
        return;
    } else if(overridesFile != "") {
        let overridesMap : Map<string, string> = new Map<string,string>();
        readFileSync(overridesFile).toString().split(/\r?\n/).forEach(line => {
            const pairing = line.split("=");
            overridesMap.set(pairing[0],pairing[1]);
        });

        overrides = Object.create(null);
        for (let [k,v] of overridesMap) {
            overrides[k] = v;
        }
    }

    const traceOption = (await window.showQuickPick(["True", "False"], {placeHolder : "Trace?"}));
    if(traceOption == undefined) {
        return;
    }
    const trace = traceOption == "True";

    const className = findTestArtifact(testClass);

    const request : runs.TestRunRequest = {
        classNames : [className],
        requestorType : "Request",
        testStream : testStream,
        obr : obr,
        mavenRepository : mavenRepo,
        overrides: overrides,
        trace : trace
    };

    const uid = getRandomUid();
    await runsApi.runsIdPost(uid, request);

    const runsResponse = (await runsApi.runsIdGet(uid)).body;
    if(runsResponse.runs) {
        runsResponse.runs.forEach(run => {
            props.addRun(run.name);
        });
    }

    return uid;
}

function getRandomUid() : number {
    const random = (Math.random() * Math.random() * Math.pow(10, 15));
    return Math.round(random);
}