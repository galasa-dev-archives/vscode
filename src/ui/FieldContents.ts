export class FieldContents {
    public chars: string[] | undefined;
    public text: string | undefined;

    constructor(chars:string[], text:string) {
        console.log(chars);
        console.log(text);
        let isCharacters:boolean = false;

        for(let char of chars) {
            if (char === null) {
                isCharacters = true;
                break;
            }
        }

        if (isCharacters) {
            this.chars = chars;
            this.text = undefined;
        } else {
            this.chars = undefined;

            let convString: string[] = new Array(chars.length);
            for (let i = 0; i < chars.length; i++) {
                convString[i] = chars[i];
            }

            let test =""
            convString.forEach(item => {test = test + item});
            this.text = test;
        }

    }
}