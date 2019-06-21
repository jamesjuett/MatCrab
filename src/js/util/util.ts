
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function assert(condition: any, message = "") {
    if (!condition)
        throw Error("Assert failed: " + message);
};

// http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
export function getQueryString() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string: {[index:string]: any} = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}
export namespace MatlabMath {

    // the initial seed
    let seed = 0;

    export function setRandomSeed(newSeed: number) {
        seed = newSeed;
    }

    export function random(min: number = 0, max: number = 1) {
        seed = (seed * 9301 + 49297) % 233280;
        return seededRandom(seed, min, max);
    };

    export function seededRandom(seed: number, min: number = 0, max: number = 1) {
        var rnd = seed % 233280 / 233280;
    
        rnd = min + rnd * (max - min);
        rnd = Math.max(min, Math.min(max, rnd));
        return rnd;
    }

}

export namespace Color {

    export const WHITE = "#FFFFFF";
    export const LIGHT_LETTERS = "ABCDEF";

    export function toColor(obj: {toString(): string}, letters: string = "123456789ABCDEF") {

        // Generate a hash for the object. First toString, then hash the string.
        // String hash based on https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
        var str = obj.toString();
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    
        // use hash as seed for RNG
        return seededRandomColor(Math.abs(hash), letters);
    }
    
    function seededRandomColor(seed: number, letters: string = "123456789ABCDEF") {
    
        // http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
        letters = letters || "0123456789ABCDEF";
        var color = '#';
        MatlabMath.setRandomSeed(seed);
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(MatlabMath.random() * letters.length)];
        }
        return color;
    }
    
    export function randomColor(letters: string = "123456789ABCDEF") {
    
        // http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
        letters = letters || "0123456789ABCDEF";
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(MatlabMath.random() * letters.length)];
        }
        return color;
    }
}