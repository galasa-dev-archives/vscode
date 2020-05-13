/* tslint:disable */
/* eslint-disable */
/**
 * Galasa Web Requests
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface TestRunRequest
 */
export interface TestRunRequest {
    /**
     * 
     * @type {Array<object>}
     * @memberof TestRunRequest
     */
    classNames?: Array<object>;
    /**
     * 
     * @type {string}
     * @memberof TestRunRequest
     */
    requestorType?: string;
    /**
     * 
     * @type {string}
     * @memberof TestRunRequest
     */
    testStream?: string;
    /**
     * 
     * @type {string}
     * @memberof TestRunRequest
     */
    obr?: string;
    /**
     * 
     * @type {string}
     * @memberof TestRunRequest
     */
    mavenRepository?: string;
    /**
     * 
     * @type {string}
     * @memberof TestRunRequest
     */
    sharedEnvironmentPhase?: string;
    /**
     * 
     * @type {string}
     * @memberof TestRunRequest
     */
    sharedEnvironmentRunName?: string;
    /**
     * 
     * @type {object}
     * @memberof TestRunRequest
     */
    overrides?: object;
    /**
     * 
     * @type {boolean}
     * @memberof TestRunRequest
     */
    trace?: boolean;
}

export function TestRunRequestFromJSON(json: any): TestRunRequest {
    return TestRunRequestFromJSONTyped(json, false);
}

export function TestRunRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): TestRunRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'classNames': !exists(json, 'classNames') ? undefined : json['classNames'],
        'requestorType': !exists(json, 'requestorType') ? undefined : json['requestorType'],
        'testStream': !exists(json, 'testStream') ? undefined : json['testStream'],
        'obr': !exists(json, 'obr') ? undefined : json['obr'],
        'mavenRepository': !exists(json, 'mavenRepository') ? undefined : json['mavenRepository'],
        'sharedEnvironmentPhase': !exists(json, 'sharedEnvironmentPhase') ? undefined : json['sharedEnvironmentPhase'],
        'sharedEnvironmentRunName': !exists(json, 'sharedEnvironmentRunName') ? undefined : json['sharedEnvironmentRunName'],
        'overrides': !exists(json, 'overrides') ? undefined : json['overrides'],
        'trace': !exists(json, 'trace') ? undefined : json['trace'],
    };
}

export function TestRunRequestToJSON(value?: TestRunRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'classNames': value.classNames,
        'requestorType': value.requestorType,
        'testStream': value.testStream,
        'obr': value.obr,
        'mavenRepository': value.mavenRepository,
        'sharedEnvironmentPhase': value.sharedEnvironmentPhase,
        'sharedEnvironmentRunName': value.sharedEnvironmentRunName,
        'overrides': value.overrides,
        'trace': value.trace,
    };
}


