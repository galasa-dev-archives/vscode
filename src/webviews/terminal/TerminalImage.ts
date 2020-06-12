import { TerminalSize } from "./TerminalSize";
import { TerminalField } from "./TerminalField";

export class TerminalImage {
    public sequence:number;
    public id:string;
    public inbound:boolean;
    public imageSize:TerminalSize;
    public cursorColumn:number;
    public cursorRow:number;
    public fields:TerminalField[];
    constructor(sequence:number,
                    id:string,
                        inbound:boolean,
                            imageSize:TerminalSize,
                                cursorColumn:number, 
                                    cursorRow:number, 
                                        fields:TerminalField[]) {
        this.sequence = sequence;
        this.id = id;
        this.inbound = inbound;
        this.imageSize = imageSize;
        this.cursorColumn = cursorColumn;
        this.cursorRow = cursorRow;
        this.fields = fields;
    }
}