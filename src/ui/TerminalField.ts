import { FieldContents } from "./FieldContents";

export class TerminalField {
    public row:number;
    public column:number;
    private fieldProtected:boolean;
    private fieldDisplay:boolean;
    public contents:FieldContents[];

    constructor(row:number, column:number, fieldProtected:boolean, 
                    fieldDisplay:boolean, contents:FieldContents[]) {
        this.row = row;
        this.column = column;
        this.fieldProtected = fieldProtected;
        this.fieldDisplay = fieldDisplay;
        this.contents = contents;
    }
    
}