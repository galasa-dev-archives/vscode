import { DefaultApi, TestRunRequest, CPSRequest } from "galasa-web-api";
import { window, workspace } from "vscode";
import { findTestArtifact } from "../DebugConfigHandler";
import { TestCase } from "../TestExtractor";

export async function submitRuns(api : DefaultApi, testClass : TestCase) {

    window.showInformationMessage(getRandomUid().toString());

    const testStreamRequest : CPSRequest = {namespace : "framework", prefix : "test", suffix : "streams"};
    const testStreamResponse : any = (await api.propertystoreGet(testStreamRequest)).body;

    const testStreamResponses : string = testStreamResponse.value;
    const testStreams : string[] = testStreamResponses.split(",");

    const testStream = await window.showQuickPick(testStreams, {placeHolder : "Name of test stream"});
    if(!testStream) {
        return;
    }
    if(!testStreams.includes(testStream)) {
        window.showErrorMessage("Invalid Test Stream: " + testStream);
        return;
    }

    const obrRequest : CPSRequest = {namespace : "framework", prefix : "test.stream", suffix : "obr", infixes : [testStream]};
    const obrResponse : any = (await api.propertystoreGet(obrRequest)).body;
    const obr = obrResponse.value;

    if(!obr) {
        window.showErrorMessage("Invalid Obr for test stream: " + testStream);
        return;
    }

    const mavenRepoRequest : CPSRequest = {namespace : "framework", prefix : "test.stream", suffix : "maven.repo", infixes : [testStream]};
    const mavenRepoResponse : any = (await api.propertystoreGet(mavenRepoRequest)).body;
    const mavenRepo = mavenRepoResponse.value;

    if(!mavenRepo) {
        window.showErrorMessage("Invalid maven repo for test stream: " + testStream);
        return;
    }

    const propertiesFiles = await workspace.findFiles("*/properties");
    let fileNames : any[] = [];
    propertiesFiles.forEach(file => {
        fileNames.push(file.toString().substring(file.toString().lastIndexOf("/"), file.toString().length));
    });
    const overrides = await window.showQuickPick(fileNames, {placeHolder : "Overrides File"});

    const traceOption = (await window.showQuickPick(["True", "False"], {placeHolder : "Overrides File"}));
    if(!traceOption) {
        return;
    }
    const trace = traceOption == "True";

    const className = findTestArtifact(testClass);

    const request : TestRunRequest = {
        classNames : [className],
        requestorType : "Request",
        testStream : testStream,
        obr : obr,
        mavenRepository : mavenRepo,
        overrides: overrides,
        trace : trace
    };

    // api.runsIdPost(getRandomUid(), request);
}

function getRandomUid() : number {
    const random = (Math.random() * Math.random() * Math.pow(10, 15));
    return Math.round(random);
}