export class GalasaProperties {

    private bootstrapUrl : string | undefined;

    constructor(bootstrap : string | undefined) {
        this.bootstrapUrl = bootstrap;
    }

    public getEndpointUrl() : string | undefined {
        if(this.bootstrapUrl) {
            return this.bootstrapUrl.substring(0, this.bootstrapUrl.indexOf("/bootstrap"));
        }
        return undefined;
    }
}