export class TerminalField {
    public row:number | undefined;
    public column:number | undefined;
    private fieldProtected:boolean | undefined;
    private fieldDisplay:boolean | undefined;

    constructor(row:number | undefined, column:number | undefined, fieldProtected:boolean | undefined, fieldDisplay:boolean | undefined) {
        this.row = row;
        this.column = column;
        this.fieldProtected = fieldProtected;
        this.fieldDisplay = fieldDisplay;
    }
    
}