export class TerminalSize {
    public columns:number | undefined;
    public rows:number | undefined;

    constructor(columns:number, rows:number) {
        this.columns = columns;
        this. rows = rows;
    }
}