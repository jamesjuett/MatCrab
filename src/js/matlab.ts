
export namespace MatlabMath {

    // the initial seed
    let seed = 0;

    export function random(min: number = 0, max: number = 1) {
        seed = (seed * 9301 + 49297) % 233280;
        return seededRandom(seed, min, max);
    };

    export function seededRandom(seed: number, min: number = 0, max: number = 1) {
        var rnd = seed / 233280;
    
        rnd = min + rnd * (max - min);
        rnd = Math.max(min, Math.min(max, rnd));
        return rnd;
    }

}

export namespace Color {

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
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(MatlabMath.seededRandom(seed) * letters.length)];
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



interface Visualizable {
    visualize_html(containingElem: JQuery) : void
}

type DataType = "int" | "double" | "logical";

export abstract class MatrixHistory implements Visualizable {

    public readonly color = Color.randomColor();

    public abstract visualize_html(containingElem: JQuery) : void;
}

// class AppendRows extends MatrixHistory {
    
//     public readonly rows: Visualizable[];

//     public constructor(rows : Visualizable[]) {
//         super();
//         this.rows = rows;
//     }

//     public visualize_html(containingElem: JQuery) {
//         let table = $("<table></table>");
//         table.addClass("matlab-table");
//         table.css("background-color", this.color);

//         let rows = this.rows;
//         for (let i = 0; i < rows.length; ++i) {
//             let tr = $("<tr></tr>");
//             let td = $("<td></td>");
//             table.append(tr);
//             tr.append(td);
//             rows[i].visualize_html(td);
//         }
//         containingElem.append(table);
//     }
// }

// class AppendCols extends MatrixHistory {
    
//     public readonly cols: Visualizable[];

//     public constructor(cols : Visualizable[]) {
//         super();
//         this.cols = cols;
//     }

//     public visualize_html(containingElem: JQuery) {
//         let cols = this.cols;
//         if (cols.length == 1) {
//             // Single element row - just visualize the element, not as a row
//             cols[0].visualize_html(containingElem);
//         }
//         else {
//             let table = $("<table></table>");
//             table.addClass("matlab-table");
//             table.css("background-color", this.color);
//             let tr = $("<tr></tr>");
//             table.append(tr);

//             for (let i = 0; i < cols.length; ++i) {
//                 let td = $("<td></td>");
//                 tr.append(td);

//                 if(cols[i].isScalar()){
//                     td.html(cols[i].scalarValue());
//                 }
//                 else{
//                     cols[i].visualize_html(td);
//                 }
//             }
//             dest.append(table);
//         }
//     }
// });


// MatrixHistory.Range = MatrixHistory.extend({
//     _name: "MatrixHistory.Range",

//     init : function(range) {
//         this.initParent();
//         this.range = range;
//     },

//     visualize_html : function(dest) {
//         var range = this.range;
//         var table = $("<table></table>");
//         table.append('<svg><defs><marker id="arrow" markerWidth="10" markerHeight="10" refx="9" refy="3" orient="auto" markerUnits="strokeWidth"> <path d="M0,0 L0,6 L9,3 z" fill="#000" /> </marker> </defs><g transform="translate(-10,0)"><line x1="22" y1="25" x2="100%" y2="25" stroke="#000" stroke-width="1" marker-end="url(#arrow)" /></g> </svg>');

//         table.addClass("matlab-range");
//         table.css("background-color", this.color);
//         var tr = $("<tr></tr>");
//         table.append(tr);

//         for (var i = 0; i < range.length; ++i) {
//             var td = $("<td></td>");
//             tr.append(td);

//             // NOTE: The numbers themselves in a range are calculated and thus
//             //       have a history, although in the future it may be useful to
//             //       somehow show the history of the start, step, and end.
// //                    range[i].visualize_html(td);
//             var temp = $("<div></div>");
//             temp.addClass("matlab-scalar");
//             var tempSpan = $("<span></span>");
//             var num = Matrix.formatNumber(range[i]);
//             if (num.length > 3) {
//                 temp.addClass("double");
//             }
//             tempSpan.html(num);
//             temp.append(tempSpan);
//             td.append(temp);
//         }
//         dest.append(table);
//     }
// });

// MatrixHistory.Scalar = MatrixHistory.extend({
//     _name: "MatrixHistory.Scalar",

//     init : function(value) {
//         this.initParent();
//         this.value = value;
//     },

//     visualize_html : function(dest) {
//         var temp = $("<div></div>");
//         temp.addClass("matlab-scalar");
//         var tempSpan = $("<span></span>");
//         var num = Matrix.formatNumber(this.value);
//         if (num.length > 3) {
//             temp.addClass("double");
//         }
//         tempSpan.html(num);
//         temp.append(tempSpan);
//         dest.append(temp);
//     }
// });

// MatrixHistory.Raw = MatrixHistory.extend({
//     _name: "MatrixHistory.Raw",

//     init : function(matrix) {
//         this.initParent();
//         this.matrix = matrix;
//     },

//     visualize_html : function(dest) {
//         var table = $("<table></table>");
//         table.addClass("matlab-table");
//         table.css("background-color", this.color);
//         for (var r = 1; r <= this.matrix.numRows(); ++r) {
//             var tr = $("<tr></tr>");
//             table.append(tr);
//             for (var c = 1; c <= this.matrix.numCols(); ++c) {
//                 var td = $("<td></td>");
//                 var temp = $("<div></div>");
//                 temp.addClass("matlab-scalar");
//                 var tempSpan = $("<span></span>");
//                 tempSpan.html(this.matrix.at(r,c));
//                 temp.append(tempSpan);
//                 td.html(temp);
//                 tr.append(td);
//             }

//         }

//         dest.append(table);
//     }
// });

// export class MatrixIndexHistory extends MatrixHistory {

//     private readonly matrixIndex: MatrixIndex;
//     private readonly originalMatrix: Matrix;

//     public constructor(matrixIndex: MatrixIndex) {
//         super();
//         this.matrixIndex = matrixIndex;
//         this.originalMatrix = this.matrixIndex.source().clone();
//     }

//     public visualize_html(containingElem: JQuery) {
//         let source = this.matrixIndex.source();
//         let table = $("<table></table>");
//         table.addClass("matlab-index");
//         table.css("background-color", this.color);

//         for (let r = 1; r <= source.numRows(); ++r) {
//             let tr = $("<tr></tr>");
//             table.append(tr);
//             for (let c = 1; c <= source.numCols(); ++c) {
//                 let td = $("<td><div class='highlight'></div></td>");
//                 if (this.matrixIndex.isSelected(r, c)){
//                     td.addClass("selected");
//                 }
//                 let temp = $("<div></div>");
//                 temp.addClass("matlab-scalar");
//                 let tempSpan = $("<span></span>");
//                 tempSpan.html(this.originalMatrix.at(r,c));
//                 temp.append(tempSpan);
//                 td.append(temp);
//                 tr.append(td);
//             }

//         }

//         containingElem.append(table);
//     }
// }



export class Matrix {

    //Static functions
    // TODO: Should this really be a static function of matrix?
    public static formatNumber(num: number) {
        if (Math.trunc(num) == num){
            return num.toString();
        }
        else{
            return num.toPrecision(2);
        }
    }

    // public append_cols(mats: Matrix[]) {
    //     mats = mats.map(function(m){return m.matrixValue()});
    //     var rows = mats[0].rows;
    //     return new Matrix(
    //         mats[0].rows,
    //         mats.reduce(function(prev, current){
    //             return prev + current.cols;
    //         },0),
    //         mats.reduce(function(newData, mat){
    //             if (mat.rows !== rows){
    //                 throw {message: "Mismatched matrix number of rows."};
    //             }
    //             newData.pushAll(mat.data);
    //             return newData;
    //         }, []),
    //         mats[0].dataType()
    //         )
    //     );
    // }
    // append_rows : function(mats) {
    //     mats = mats.map(function(m){return m.matrixValue()});
    //     var newCols = [];
    //     var cols = mats[0].cols;
    //     var newRows = 0;
    //     for(var i = 0; i < cols; ++i) {
    //         newCols.push([]);
    //     }
    //     for(var i = 0; i < mats.length; ++i) {
    //         var mat = mats[i];
    //         newRows += mat.rows;
    //         if (mat.cols !== cols) {
    //             throw {message: "Mismatched matrix number of columns."};
    //         }
    //         for(var c = 0; c < cols; ++c) {
    //             for(var r = 0; r < mat.rows; ++r) {
    //                 newCols[c].push(mat.at(r+1, c+1));
    //             }
    //         }
    //     }
    //     var newData = [].concat.apply([], newCols);
    //     return Matrix.instance(newRows, cols, newData, mats[0].dataType(),
    //         MatrixHistory.AppendRows.instance(mats.map(function(mat){
    //             return mat.history;
    //         }))
    //     );
    // },

    public static scalar(value: number, dataType: DataType) {
        return new Matrix(1, 1, [value], dataType);
    }

    // // THROWS: on mismatched dimensions
    // binaryOp : function(leftMat, rightMat, operate, dataType) {
    //     var newData = [];
    //     var numRows;
    //     var numCols;
    //     if (leftMat.numRows() === rightMat.numRows() && leftMat.numCols() === rightMat.numCols()) {
    //         // Same dimensions (also covers both scalars)
    //         for (var i = 0; i < leftMat.length(); ++i) {
    //             newData.push(operate(leftMat.getRaw0(i), rightMat.getRaw0(i)));
    //         }
    //         numRows = leftMat.numRows();
    //         numCols = leftMat.numCols();
    //     }
    //     else if (leftMat.isScalar()){
    //         var leftScalar = leftMat.scalarValue();
    //         for (var i = 0; i < rightMat.length(); ++i) {
    //             newData.push(operate(leftScalar, rightMat.getRaw0(i)));
    //         }
    //         numRows = rightMat.numRows();
    //         numCols = rightMat.numCols();
    //     }
    //     else if (rightMat.isScalar()){
    //         var rightScalar = rightMat.scalarValue();
    //         for (var i = 0; i < leftMat.length(); ++i) {
    //             newData.push(operate(leftMat.getRaw0(i), rightScalar));
    //         }
    //         numRows = leftMat.numRows();
    //         numCols = leftMat.numCols();
    //     }
    //     else{
    //         throw {message: "Mismatched dimensions for operator " + this.op + ". LHS is a " +
    //         leftMat.numRows() + "x" + leftMat.numCols() + " and RHS is a " +
    //         rightMat.numRows() + "x" + rightMat.numCols() + "."};
    //     }
    //     return Matrix.instance(numRows, numCols, newData, dataType);
    // },
    // unaryOp : function(mat, operate, dataType) {
    //     var newData = [];
    //     var numRows = mat.numRows();
    //     var numCols = mat.numCols();
    //     for (var i = 0; i < mat.length(); ++i) {
    //         newData.push(operate(mat.getRaw0(i)));
    //     }
    //     return Matrix.instance(numRows, numCols, newData, dataType);
    // },

    public readonly rows: number;
    public readonly cols: number;
    public readonly height: number;
    public readonly width: number;
    public readonly dataType: DataType;

    public readonly isScalar: boolean;
   
    public readonly color: string;

    private readonly data: number[];

    public constructor(rows: number, cols: number, data: number[], dataType: DataType) {
        assert(rows*cols === data.length, "rows: " + rows + "cols: " + cols + " data: " + data.length);
        this.rows = rows;
        this.cols = cols;
        this.height = rows;
        this.width = cols;
        this.data = data;
        this.dataType = dataType;

        this.isScalar = rows === 1 && cols === 1;
        // this.history = history || MatrixHistory.Raw.instance(this);

        this.color = Color.toColor([this.rows, this.height, this.data], "6789ABCDEF");
    }

    public toString() : string {
        return "Rows: " + this.rows + " Cols: " + this.cols + "\nData: " + JSON.stringify(this.data);
    }

    public clone() : Matrix {
        // Note the .slice() copies the data array
        return new Matrix(this.rows, this.cols, this.data.slice(), this.dataType);
    }
    
    public linearIndex(row: number, col: number) {
        row = row - 1;
        col = col - 1;
        return col * this.rows + row + 1;
    }

    public atLinear(index: number) {
        return this.data[index - 1];
    }

    public setLinear(index: number, value: number) {
        this.data[index - 1] = value;
    }

    public at(row: number, col: number) {
        row = row - 1;
        col = col - 1;
        return this.data[col * this.rows + row]
    }

    public setAt(row: number, col: number, value: number) {
        row = row - 1;
        col = col - 1;
        this.data[col * this.rows + row] = value;
    }

    // TODO: This function seems confusing. Perhaps there's a better way.
    public length(dimension: 0 | 1 | 2 = 0) {
        if (dimension === 0){ // either dimension not provided or is 0
            return this.rows * this.cols;
        }
        else if (dimension === 1) {
            return this.rows;
        }
        else{ // if (dimension === 2) {
            return this.cols;
        }
    }

    public scalarValue() {
        return this.data[0];
    }

    // matrixValue : function() {
    //     return this;
    // },

    public contains(value: number) : boolean {
        return this.data.indexOf(value) !== -1;
    }

    public visualize_html(containingElem: JQuery, options?: {[index:string]: any}) {

        let table = $("<table></table>");
        table.addClass("matlab-table");

        // Logical arrays are black/white
        if (this.dataType !== "logical") {
            table.css("background-color", this.color);
        }
        for (let r = 1; r <= this.rows; ++r) {
            let tr = $("<tr></tr>");
            table.append(tr);
            for (let c = 1; c <= this.cols; ++c) {
                let td = $("<td></td>");
                let temp = $("<div></div>");
                temp.addClass("matlab-scalar");
                if (this.dataType === "logical"){
                    td.addClass(this.at(r,c) ? "logical-1" : "logical-0");
                }
                let tempSpan = $("<span></span>");
                tempSpan.html(this.at(r,c).toString());
                temp.append(tempSpan);
                td.append(temp);
                tr.append(td);
            }
        }

        containingElem.append(table);
    }

}

// var MatrixIndex = Class.extend({
//     _name: "MatrixIndex",

//     delegate : function(variable, indices) {
//         if (indices.length > 1) {
//             return this.Coordinates;
//         }
//         var index = indices[0];
//         if (index === "colon" || index.dataType() !== "logical") {
//             return this.Indices;
//         }
//         else{
//             return this.Logical;
//         }
//     },

//     init : function(variable) {
//         this.variable_ = variable;
//         this.originalMatrix = this.source().clone();

//         this.color = this.originalMatrix.color;
//         this.history = MatrixHistory.MatrixIndex.instance(this);
//     },
//     variable : function() {
//         return this.variable_;
//     },
//     source : function () {
//         return this.variable_.value;
//     },

//     visualize_html : function(dest){
//         this.history.visualize_html(dest);
//     },

//     isSelected : Class._ABSTRACT,
//     length : Class._ABSTRACT,

//     // THROWS: in case of a dimension mismatch
//     assign : Class._ABSTRACT,


//     matrixValue : Class._ABSTRACT
// });

// MatrixIndex.Coordinates = MatrixIndex.extend({
//     _name: "MatrixIndex.Coordinates",

//     init : function(variable, indices) {
//         this.initParent(variable);

//         if (indices.length > 2) {
//             throw {message: "Too many indices for row/column indexing. Only up to 2D arrays are supported. (Maybe you meant to select a matrix of indices but forgot the []?)"};
//         }
//         this.selectedRows = indices[0];
//         this.selectedCols = indices[1];

//         // HACK that makes life much easier
//         if (this.selectedRows === "colon") {
//             var allRows = [];
//             for(var i = 1; i <= this.source().numRows(); ++i) {
//                 allRows.push(i);
//             }
//             this.selectedRows = Matrix.instance(allRows.length, 1, allRows, "integer");
//         }
//         if (this.selectedCols === "colon") {
//             var allCols = [];
//             for(var i = 1; i <= this.source().numCols(); ++i) {
//                 allCols.push(i);
//             }
//             this.selectedCols = Matrix.instance(allCols.length, 1, allCols, "integer");
//         }

//         // Check that all indices are within bounds
//         for(var i = 0; i < this.selectedRows.length(); ++i){
//             var rowIndex = this.selectedRows.getRaw0(i);
//             if (rowIndex < 1 || rowIndex > this.source().numRows()){
//                 throw {message: "Row index " + rowIndex + " is out of bounds."};
//             }
//         }
//         for(var i = 0; i < this.selectedCols.length(); ++i){
//             var colIndex = this.selectedCols.getRaw0(i);
//             if (colIndex < 1 || colIndex > this.source().numCols()){
//                 throw {message: "Column index " + colIndex + " is out of bounds."};
//             }
//         }
//     },
//     isSelected : function(r, c){
//         return (this.selectedRows === "colon" || this.selectedRows.contains(r)) &&
//             (this.selectedCols === "colon" || this.selectedCols.contains(c));
//     },
//     matrixValue : function(){
//         var copyData = [];
//         for(var i = 1; i <= this.length(); ++i) {
//             copyData.push(this.getRaw(i));
//         }
//         return Matrix.instance(this.numRows(), this.numCols(), copyData, this.source().dataType(), this.history);
//     },
//     assign : function(mat){
//         var nr1 = this.numRows();
//         var nc1 = this.numCols();
//         var nr2 = mat.numRows();
//         var nc2 = mat.numCols();
//         // For coordinate indexing, the dimensions must match exactly,
//         // except that rows/cols may be switched around if one of them is 1.
//         // (I hate you matlab)
//         if (nr1 === nr2 && nc1 === nc2 || (nr1 === 1 || nc1 === 1) && nr1 === nc2 && nc1 === nr2) {
//             for (var i = 1; i <= this.length(); ++i) {
//                 this.setRaw(i, mat.getRaw(i));
//             }
//         }
//         else if (mat.isScalar()) {
//             for (var i = 1; i <= this.length(); ++i) {
//                 this.setRaw(i, mat.scalarValue());
//             }
//         }
//         else {
//             throw {message: "Subscripted assignment dimension mismatch. The left hand side indexing expression" +
//             " gives a " + nr1 + "x" + nc1 + " while the right hand side is a " + nr2 + "x" + nc2 + "."};
//         }
//         this.variable().refresh();
//     },
//     length : function() {
//         return this.numRows() * this.numCols();
//     },
//     numRows : function() {
//         return this.selectedRows === "colon" ? this.source().numRows() : this.selectedRows.length();
//     },
//     numCols : function() {
//         return this.selectedCols === "colon" ? this.source().numCols() : this.selectedCols.length();
//     },
//     getRaw : function(index) {
//         // AHHHH this math kill me now
//         var index0 = index - 1;
//         var whichCol0 = integerDivision(index0, this.numRows());
//         var whichRow0  = index0 % this.numRows();
//         return this.source().at(this.selectedRows.getRaw(whichRow0+1), this.selectedCols.getRaw(whichCol0+1));
//     },
//     setRaw : function(index, scalar) {
//         var index0 = index - 1;
//         var whichCol0 = integerDivision(index0, this.numRows());
//         var whichRow0  = index0 % this.numRows();
//         this.source().setAt(this.selectedRows.getRaw(whichRow0+1), this.selectedCols.getRaw(whichCol0+1), scalar);
//     }

// });

// MatrixIndex.Logical = MatrixIndex.extend({
//     _name: "MatrixIndex.Logical",

//     init : function(variable, indices) {
//         this.initParent(variable);

//         this.logicalMatrix = indices[0];

//         // Check that the logical matrix is not larger than the one we're indexing
//         var source = this.source();
//         if (this.logicalMatrix.length() > source.length()){
//             throw {message: "Logical index matrix has " + this.logicalMatrix.length()
//             + " elements, but source matrix only has " + source.length() + " elements."};
//         }
//     },

//     isSelected : function(r, c){
//         var index = this.source().rawIndex(r, c);
//         return index <= this.logicalMatrix.length() && this.logicalMatrix.getRaw(index) === 1;
//     },
//     length : function() {
//         if (!this.length_mem && this.length_mem !== 0) {
//             var count = 0;
//             for (var i = 0; i < this.logicalMatrix.length(); ++i) {
//                 if (this.logicalMatrix.getRaw0(i)) {
//                     ++count;
//                 }
//             }
//             this.length_mem = count;
//         }
//         return this.length_mem;
//     },
//     matrixValue : function(){
//         var copyData = [];
//         var source = this.source();
//         for(var i = 0; i < this.logicalMatrix.length(); ++i) {
//             if (this.logicalMatrix.getRaw0(i)){
//                 copyData.push(source.getRaw0(i));
//             }
//         }
//         return Matrix.instance(this.length(), 1, copyData, this.source().dataType(), this.history);
//     },
//     assign : function(mat) {
//         var thisLength = this.length();
//         var matLength = mat.length();
//         var source = this.source();

//         if (mat.isScalar()) {
//             var scalarValue = mat.scalarValue();
//             for(var i = 0; i < this.logicalMatrix.length(); ++i) {
//                 if (this.logicalMatrix.getRaw0(i)){
//                     source.setRaw0(i, scalarValue);
//                 }
//             }
//         }
//         else if (thisLength === matLength) {
//             var m = 0;
//             for(var i = 0; i < this.logicalMatrix.length(); ++i) {
//                 if (this.logicalMatrix.getRaw0(i)){
//                     source.setRaw0(i, mat.getRaw0(m));
//                     ++m;
//                 }
//             }
//         }
//         else{
//             throw {message: "The length of the RHS matrix (" + matLength + ") does not match the" +
//             " number of selected elements in the logically indexed matrix on the LHS (" + thisLength + ")."};
//         }

//         this.variable().refresh();
//     },

//     visualize_html : function(dest) {
//         var source = this.source();
//         var table = $("<table></table>");
//         table.addClass("matlab-index");
//         table.css("background-color", this.color);
//         for (var r = 1; r <= source.numRows(); ++r) {
//             var tr = $("<tr></tr>");
//             table.append(tr);
//             for (var c = 1; c <= source.numCols(); ++c) {
//                 var td = $("<td><div class='highlight'></div></td>");
//                 if (this.isSelected(r, c)){
//                     td.addClass("selected");
//                 }

//                 var logicalIndexElem = $("<div></div>");
//                 logicalIndexElem.addClass("matlab-raw-index");
//                 logicalIndexElem.html(this.isSelected(r, c) ? "1" : "0");
//                 td.append(logicalIndexElem);

//                 var temp = $("<div></div>");
//                 temp.addClass("matlab-scalar");
//                 var tempSpan = $("<span></span>");
//                 tempSpan.html(this.originalMatrix.at(r,c));
//                 temp.append(tempSpan);
//                 td.append(temp);
//                 tr.append(td);
//             }

//         }

//         dest.append(table);
//     }
// });



// MatrixIndex.Indices = MatrixIndex.extend({
//     _name: "MatrixIndex.Indices",

//     delegate: function (variable, indices) {
//         if (indices[0] === "colon") {
//             return this.Colon;
//         }
//         else{
//             return this.Regular;
//         }
//     }
// });

// MatrixIndex.Indices.Regular = MatrixIndex.Indices.extend({
//     _name: "MatrixIndex.Indices",

//     delegate : function(variable, indices) {
//         if (indices[0] === "colon") {
//             return this.Colon;
//         }
//     },
    
//     init : function(variable, indices) {
//         this.initParent(variable);
//         this.indexMatrix = indices[0];

//         // Check that none of the indices are too large
//         var sourceLen = this.source().length();
//         for (var i = 0; i < this.indexMatrix.length(); ++i) {
//             var index = this.indexMatrix.getRaw0(i);
//             if (index < 1 || sourceLen < index) {
//                 throw {message: "Index " + index + " is out of bounds for the source matrix."};
//             }
//         }
//     },

//     isSelected : function(r, c){
//         return this.indexMatrix.contains(this.source().rawIndex(r, c));
//     },
//     length : function() {
//         return this.indexMatrix.length();
//     },
//     matrixValue : function(){
//         var copyData = [];
//         var source = this.source();
//         for(var i = 0; i < this.indexMatrix.length(); ++i) {
//             copyData.push(source.getRaw(this.indexMatrix.getRaw0(i)));
//         }
//         return Matrix.instance(this.indexMatrix.numRows(), this.indexMatrix.numCols(), copyData, this.source().dataType(), this.history);
//     },
//     assign : function(mat) {
//         var thisLength = this.length();
//         var matLength = mat.length();
//         var source = this.source();

//         if (mat.isScalar()) {
//             var scalarValue = mat.scalarValue();
//             for(var i = 0; i < this.indexMatrix.length(); ++i) {
//                 source.setRaw(this.indexMatrix.getRaw0(i), scalarValue);
//             }
//         }
//         else if (thisLength === matLength) {
//             for(var i = 0; i < this.indexMatrix.length(); ++i) {
//                 source.setRaw(this.indexMatrix.getRaw0(i), mat.getRaw0(i));
//             }
//         }
//         else{
//             throw {message: "The length of the RHS matrix (" + matLength + ") does not match the" +
//             " number of indices selected from the matrix on the LHS (" + thisLength + ")."};
//         }

//         this.variable().refresh();
//     },

//     visualize_html : function(dest) {
//         var source = this.source();
//         var table = $("<table></table>");
//         table.addClass("matlab-index");
//         table.css("background-color", this.color);
//         for (var r = 1; r <= source.numRows(); ++r) {
//             var tr = $("<tr></tr>");
//             table.append(tr);
//             for (var c = 1; c <= source.numCols(); ++c) {
//                 var td = $("<td><div class='highlight'></div></td>");
//                 if (this.isSelected(r, c)){
//                     td.addClass("selected");
//                 }

//                 var rawIndexElem = $("<div></div>");
//                 rawIndexElem.addClass("matlab-raw-index");
//                 rawIndexElem.html(source.rawIndex(r,c));
//                 td.append(rawIndexElem);

//                 var temp = $("<div></div>");
//                 temp.addClass("matlab-scalar");
//                 var tempSpan = $("<span></span>");
//                 tempSpan.html(this.originalMatrix.at(r,c));
//                 temp.append(tempSpan);
//                 td.append(temp);
//                 tr.append(td);
//             }

//         }

//         dest.append(table);
//     }
// });

// MatrixIndex.Indices.Colon = MatrixIndex.Indices.extend({
//     _name: "MatrixIndex.Indices.Colon",

//     init : function(variable/*, indices*/) {
//         this.initParent(variable);
//     },

//     isSelected : function(r, c){
//         return true;
//     },
//     length : function() {
//         return this.source().length();
//     },
//     matrixValue : function(){
//         var copyData = [];
//         var source = this.source();
//         for(var i = 0; i < source.length(); ++i) {
//             copyData.push(source.getRaw0(i));
//         }
//         return Matrix.instance(source.length(), 1, copyData, this.source().dataType());
//     },
//     assign : function(mat) {
//         var thisLength = this.length();
//         var matLength = mat.length();
//         var source = this.source();

//         if (mat.isScalar()) {
//             var scalarValue = mat.scalarValue();
//             for(var i = 0; i < source.length(); ++i) {
//                 source.setRaw0(i, scalarValue);
//             }
//         }
//         else if (thisLength === matLength) {
//             for(var i = 0; i < source.length(); ++i) {
//                 source.setRaw0(i, mat.getRaw0(i));
//             }
//         }
//         else{
//             throw {message: "The length of the RHS matrix (" + matLength + ") does not match the" +
//             " number of indices selected from the matrix on the LHS (" + thisLength + ")."};
//         }

//         this.variable().refresh();
//     },

//     visualize_html : function(dest) {
//         var source = this.source();
//         var table = $("<table></table>");
//         table.addClass("matlab-index");
//         table.css("background-color", this.color);
//         for (var r = 1; r <= source.numRows(); ++r) {
//             var tr = $("<tr></tr>");
//             table.append(tr);
//             for (var c = 1; c <= source.numCols(); ++c) {
//                 var td = $("<td><div class='highlight'></div></td>");
//                 if (this.isSelected(r, c)){
//                     td.addClass("selected");
//                 }

//                 var rawIndexElem = $("<div></div>");
//                 rawIndexElem.addClass("matlab-raw-index");
//                 rawIndexElem.html(source.rawIndex(r,c));
//                 td.append(rawIndexElem);

//                 var temp = $("<div></div>");
//                 temp.addClass("matlab-scalar");
//                 var tempSpan = $("<span></span>");
//                 tempSpan.html(this.originalMatrix.at(r,c));
//                 temp.append(tempSpan);
//                 td.append(temp);
//                 tr.append(td);
//             }

//         }

//         dest.append(table);
//     }
// });

var DataType = {
    Int : "int",
    Double : "double",
    Logical : "logical"
};

class Variable {

    public readonly name: string;
    public readonly value: Matrix;

    public readonly elem: JQuery;
    private readonly valueElem: JQuery;


    public constructor(name: string, value: Matrix) {
        this.name = name;
        this.value = value;

        this.elem = $('<li class="list-group-item"><span class="badge">' + name + '</span></li>')
            .prepend(this.valueElem = $('<span class="matlab-var-holder"></span>'));

        // Show initial value
        this.refresh();
    }

    public refresh() {
        var holder = this.elem.find(".matlab-var-holder");
        holder.empty();
        this.value.visualize_html(holder);
    }

    public setValue(value: Matrix) {
        (<Mutable<this>>this).value = value.clone();
        this.refresh();
    }

    // TODO: Remove?
    // matrixValue : function() {
    //     return this.value.matrixValue();
    // }

    public visualize_html(elem: JQuery) {
        return this.value.visualize_html(elem);
    }
}

class Environment {

    public static readonly global : Environment = new Environment($("#vars"));

    private readonly elem : JQuery;
    private readonly vars : {[index:string] : Variable } = {}

    public constructor (elem: JQuery) {
        this.elem = elem;
    }

    public hasVar(name : string) {
        return this.vars.hasOwnProperty(name);
    }

    public getVar(name: string){
        return this.vars[name];
    }

    public setVar(name: string, value: Matrix) {
        if (this.hasVar(name)){
            this.vars[name].setValue(value);
        }
        else{
            var v = new Variable(name, value);
            if (name !== "ans"){
                this.elem.append(v.elem);
            }
            else{
                this.elem.prepend(v.elem);
            }
            this.vars[name] = v;
        }
    }
}

type ASTNode = any;

abstract class CodeConstruct {


    // TODO: move somewhere appropriate
    public static createRedX() {
        return $('<svg><line x1="-20" y1="80%" x2="100%" y2="20%" style="stroke:rgba(255,0,0, 0.3);stroke-width:5" transform="translate(10,0)"></line><line style="stroke:rgba(255,0,0, 0.3);stroke-width:5" y2="80%" x2="100%" y1="20%" x1="-20" transform="translate(10,0)"></line></svg>');
    }

    public static create(ast: ASTNode) {
        if (ast["what"] === "assignment") {
            return new Assignment(ast);
        }
        // else if (ast["what"] === "indexed_assignment") {
        //     return new IndexedAssignment(ast);
        // }
        else {
            return Expression.create(ast);
        }
    }

    protected readonly ast: ASTNode;

    protected constructor(ast: ASTNode) {
        this.ast = ast;
    }

    public abstract evaluate(): void;
    public abstract visualize_html(elem: JQuery, options?: {[index:string]: any}): void;

}

class Assignment extends CodeConstruct {
    
    public readonly rhs: Expression;
    public readonly lhs: IdentifierExpression;

    constructor(ast: ASTNode) {
        super(ast);
        this.rhs = Expression.create(ast["exp"]);
        this.lhs = <IdentifierExpression>Expression.create(ast["identifier"])
    }

    public evaluate() {

        this.rhs.evaluate();
        this.lhs.evaluate();
        
        let env = Environment.global;
        let name = this.lhs.name;

        env.setVar(name, this.rhs.value!);
    }

    public visualize_html(elem: JQuery) {
        let wrapper = $("<div></div>");

        let top = $("<div></div>");
        top.addClass("matlab-assignment");
        top.append(this.lhs.name);

        top.append("&nbsp;=&nbsp;");

        let rhsElem = $("<div></div>");
        this.rhs.visualize_html(rhsElem);
        top.append(rhsElem);

        wrapper.append(top);

        let bottom = $("<div></div>");
        bottom.addClass("matlab-assignment-result");
        bottom.append(this.lhs.name);
        bottom.append(" is now ");


        let valueElem = $("<div></div>");
        this.lhs.visualize_html(valueElem);
        bottom.append(valueElem);

        wrapper.append(top);
        wrapper.append(bottom);


        elem.append(wrapper);
    }
}

// CodeConstruct.IndexedAssignment = CodeConstruct.extend({
//     _name : "CodeConstruct.IndexedAssignment",

//     evaluate : function() {
//         var src = this.src;
//         this.rhs = Expression.createAndEvaluate(src["rhs"]);
//         this.lhs = Expression.createAndEvaluate(src["lhs"]);

//         try{
//             this.lhs.value.assign(this.rhs.value.matrixValue());
//         }
//         catch (err) {
//             // set visualization to error state
//             this.err = err;
//             var self = this;
//             err.visualize_html = function(elem){
//                 self.visualize_html(elem)
//             };
//             throw err;
//         }

//         // return undefined
//     },

//     visualize_html : function(elem) {
//         var wrapper = $("<div></div>");

//         var top = $("<div></div>");
//         top.addClass("matlab-assignment");
//         var lhsElem = $("<div></div>");
//         this.lhs.visualize_html(lhsElem);
//         top.append(lhsElem);

//         top.append("&nbsp;=&nbsp;");

//         var rhsElem = $("<div></div>");
//         this.rhs.visualize_html(rhsElem);
//         top.append(rhsElem);

//         if (this.err){
//             top.append(this.createRedX());
//         }

//         var bottom = $("<div></div>");
//         bottom.addClass("matlab-assignment-result");

//         if (!this.err) {
//             bottom.append(this.lhs.value.variable().name);
//             bottom.append(" is now ");

//             var valueElem = $("<div></div>");
//             this.lhs.value.variable().visualize_html(valueElem);
//             bottom.append(valueElem);
//         }
//         else{
//             var errElem = $("<div></div>");
//             errElem.addClass("matlab-exp-error");
//             errElem.html(this.err.message);
//             bottom.append(errElem);
//         }

//         wrapper.append(top);
//         wrapper.append(bottom);

//         elem.append(wrapper);
//     }
// });



export abstract class Expression extends CodeConstruct {

    public readonly value? : Matrix;

    public static create(ast: ASTNode) {
        return this.grammarToSubclass[ast["what"]](ast);
    }

    // Map from "what" key in src generated by grammar to
    // the name of the subclass in the code.
    // TODO: Revise to use factory pattern or abstract factory pattern?
    private static grammarToSubclass : {[index: string]: (a: ASTNode) => Expression} = {
        // "matrix_exp": MatrixExpression,
        // "row_exp": RowExpression,
        // "range_exp": RangeExpression,
        // "or_exp": MatrixOrExpression,
        // "and_exp": MatrixAndExpression,
        // "eq_exp": EqualityExpression,
        // "rel_exp": RelationalExpression,
        // "add_exp": AddExpression,
        // "mult_exp": MultExpression,
        // "unary_exp": UnaryOpExpression,
        // "postfix_exp": PostfixExpression,
        // "call_exp": CallExpression,
        // "colon_exp": ColonExpression,
        // "end_exp": EndExpression,
        "integer": (a:ASTNode) => new LiteralExpression(a),
        "float": (a:ASTNode) => new LiteralExpression(a)
        // "identifier": IdentifierExpression
    }

    protected setValue(value: Matrix) {
        (<Mutable<this>>this).value = value;
    }

}

// class MatrixExpression extends Expression {

//     public readonly rows: readonly Expression[];

//     public constructor(ast: ASTNode) {
//         super(ast);
//         this.rows = ast["rows"].map((r:any) => Expression.create(r));
//     }

//     public evaluate() {
//         var ast = this.ast;
//         // eval rows
//         this.rows.forEach(r => {r.evaluate()});
//         this.setValue(Matrix.append_rows(this.rows.map(function(r){
//             return r.value.matrixValue();
//         })));
//         return this.value;
//     },

//     visualize_html : function(elem) {
//         var table = $("<table></table>");
//         table.addClass("matlab-table");
//         table.css("background-color", toColor(this.value, "6789ABCDEF"));

//         var rows = this.rows;
//         for (var i = 0; i < rows.length; ++i) {
//             var tr = $("<tr></tr>");
//             table.append(tr);
//             var td = $("<td></td>");
//             tr.append(td);
//             rows[i].visualize_html(td, {contained: true});
//         }
//         elem.append(table);
//     }
// });

// Expression.Row = Expression.extend({
//     _name : "Expression.Row",

//     looksLikeMatrixValue : true,

//     evaluate : function() {
//         var src = this.src;
//         this.cols = src["cols"].map(Expression.createAndEvaluate, Expression);

//         this.value = Matrix.append_cols(this.cols.map(function(c){
//             return c.value.matrixValue();
//         }));
//         return this.value;
//     },

//     visualize_html : function(elem) {
//         var cols = this.cols;
//         if (cols.length == 1) {
//             // Single element row - just visualize the element, not as a row
//             cols[0].visualize_html(elem);
//         }
//         else {
//             var table = $("<table></table>");
//             table.addClass("matlab-table");
//             table.css("background-color", toColor(this.value, "6789ABCDEF"));
//             var tr = $("<tr></tr>");
//             table.append(tr);

//             for (var i = 0; i < cols.length; ++i) {
//                 var td = $("<td></td>");
//                 tr.append(td);
//                 var col = cols[i];
//                 cols[i].visualize_html(td,{contained: true});
//             }
//             elem.append(table);
//         }
//     }
// });

// Expression.Range = Expression.extend({
//     _name : "Expression.Range",

//     looksLikeMatrixValue : true,

//     evaluate : function() {
//         var src = this.src;
//         this.start = Expression.createAndEvaluate(src.start);
//         this.end = Expression.createAndEvaluate(src.end);
//         this.step = src.step ? Expression.createAndEvaluate(src.step) : null;

//         var x = this.start.value.scalarValue();
//         var end = this.end.value.scalarValue();
//         var step = this.step ? this.step.value.scalarValue() : 1;
//         var range = [];
//         if (step > 0) { // positive step
//             if (x <= end) { // start < end
//                 while (x <= end) {
//                     range.push(x);
//                     x += step;
//                 }
//             }
//         }
//         else { // negative step
//             if (end <= x) { // end <= x
//                 while (end <= x) {
//                     range.push(x);
//                     x += step
//                 }
//             }
//         }

//         // TODO: check on type of ranges in MATLAB
//         this.value = Matrix.instance(1, range.length, range, "double", MatrixHistory.Range.instance(range));
//         return this.value;
//     },

//     visualize_html : function(elem) {
//         this.value.history.visualize_html(elem);
//     }
// });

// Expression.BinaryOp = Expression.extend({
//     _name : "Expression.BinaryOp",

//     matrixDataType : "double",

//     evaluate : function() {
//         var src = this.src;
//         this.op = src.op;
//         this.left = Expression.createAndEvaluate(src.left);
//         this.right = Expression.createAndEvaluate(src.right);

//         var leftMat = this.left.value.matrixValue();
//         var rightMat = this.right.value.matrixValue();

//         try{
//             this.value = Matrix.binaryOp(leftMat, rightMat, this.operators[this.op], this.matrixDataType);
//         }
//         catch(err) {
//             this.err = err;

//             var self = this;
//             err.visualize_html = function(elem){
//                 self.visualize_html(elem)
//             };

//             throw err;
//         }
//         return this.value;
//     },

//     visualize_html : function(elem) {
//         var wrapper = $("<div></div>");
//         var top = $("<div></div>");
//         top.addClass("matlab-exp-binaryOp");
//         var leftElem = $("<div></div>");
//         this.left.visualize_html(leftElem);
//         top.append(leftElem);

//         var opElem = $("<div></div>");
//         opElem.html("&nbsp;" + this.op + "&nbsp;");
//         top.append(opElem);

//         var rightElem = $("<div></div>");
//         this.right.visualize_html(rightElem);
//         top.append(rightElem);
        
//         elem.append(top);
        
//         if (this.err){
//             top.append(this.createRedX());

//             var bottom = $("<div></div>");
//             bottom.addClass("matlab-exp-bottom");
//             var errElem = $("<div></div>");
//             errElem.addClass("matlab-exp-error");
//             errElem.html(this.err.message);
//             bottom.append(errElem);
//             elem.append(bottom);
//         }

//         elem.append(wrapper);
//     }
// });

// Expression.Add = Expression.BinaryOp.extend({
//     _name : "Expression.Add",

//     operators : {
//         "+" : function(a,b) {
//             return a + b;
//         },
//         "-" : function(a, b) {
//             return a - b;
//         }
//     }
// });

// Expression.Mult = Expression.BinaryOp.extend({
//     _name : "Expression.Mult",

//     operators : {
//         "*" : function(a,b) {
//             return a * b;
//         },
//         "/" : function(a, b) {
//             return a / b;
//         },
//         "^" : function(a,b) {
//             return Math.pow(a, b);
//         },
//         ".*" : function(a, b) {
//             return a * b;
//         },
//         "./" : function(a,b) {
//             return a / b;
//         },
//         ".^" : function(a, b) {
//             return Math.pow(a, b);
//         }
//     },

//     evaluate : Class._ADDITIONALLY(function(){
//         if (this.op === "*" || this.op === "/" || this.op === "^"){
//             var leftMat = this.left.value.matrixValue();
//             var rightMat = this.right.value.matrixValue();
//             if (!leftMat.isScalar() && !rightMat.isScalar()){
//                 throw {message: "Sorry, matrix multiplication, division, and exponentiation are not supported." +
//                 " You may use the element-wise versions (i.e. .*, ./, .^)."}
//             }
//         }
//     })
// });

// Expression.MatrixOr = Expression.BinaryOp.extend({
//     _name : "Expression.Amd",

//     matrixDataType : "logical",

//     operators : {
//         "|" : function(a,b) {
//             return (a || b) ? 1 : 0;
//         }
//     }
// });

// Expression.MatrixAnd = Expression.BinaryOp.extend({
//     _name : "Expression.And",

//     matrixDataType : "logical",

//     operators : {
//         "&" : function(a,b) {
//             return (a && b) ? 1 : 0;
//         }
//     }
// });

// Expression.Equality = Expression.BinaryOp.extend({
//     _name : "Expression.Equality",

//     matrixDataType : "logical",

//     operators : {
//         "==" : function(a,b) {
//             return (a === b) ? 1 : 0;
//         },
//         "~=" : function(a, b) {
//             return (a !== b) ? 1 : 0;
//         }
//     }
// });

// Expression.Relational = Expression.BinaryOp.extend({
//     _name : "Expression.Relational",

//     matrixDataType : "logical",

//     operators : {
//         "<" : function(a,b) {
//             return (a < b) ? 1 : 0;
//         },
//         "<=" : function(a, b) {
//             return (a <= b) ? 1 : 0;
//         },
//         ">" : function(a,b) {
//             return (a > b) ? 1 : 0;
//         },
//         ">=" : function(a, b) {
//             return (a >= b) ? 1 : 0;
//         }
//     }
// });

// Expression.UnaryOp = Expression.extend({
//     _name : "Expression.UnaryOp",

//     operators : {
//         "+" : function(x) {
//             return x;
//         },
//         "-" : function(x) {
//             return -x;
//         },
//         "~" : function(x) {
//             return x ? 0 : 1;
//         }
//     },

//     operatorDataTypes : {
//         "+" : "double",
//         "-" : "double",
//         "~" : "logical"
//     },

//     evaluate : function() {
//         var src = this.src;
//         this.op = src.op;
//         this.sub = Expression.createAndEvaluate(src.sub);

//         var subMat = this.sub.value.matrixValue();

//         this.value = Matrix.unaryOp(subMat, this.operators[this.op], this.operatorDataTypes[this.op]);
//         return this.value;
//     },

//     visualize_html : function(elem) {
//         var wrapper = $("<div></div>");
//         wrapper.addClass("matlab-exp-unaryOp");

//         var opElem = $("<div></div>");
//         opElem.html(this.op + "&nbsp;");
//         wrapper.append(opElem);

//         var subElem = $("<div></div>");
//         this.sub.visualize_html(subElem);
//         wrapper.append(subElem);

//         elem.append(wrapper);
//     }
// });


// // TODO: if indexed matrix is modified, should still show original version
// Expression.Index = Expression.Call = Expression.extend({
//     _name : "Expression.Call",

//     currentIndexedVariable : null,
//     currentIndexedDimension : 0,

//     evaluate : function() {
//         var src = this.src;
//         this.receiver = Expression.createAndEvaluate(src["receiver"]);

//         if (isA(this.receiver.value, Variable)){
//             // Matlab checks for variables first and trys to index them

//             //record old matrix being indexed and set to be this one. used for end
//             var oldIndexedMatrix = Expression.Index.currentIndexedVariable;
//             Expression.Index.currentIndexedVariable = this.receiver.value;

//             if (src["args"].length === 1){
//                 this.args = src["args"].map(Expression.createAndEvaluate, Expression);
//             }
//             else{
//                 this.args = src["args"].map(function(arg){
//                     ++Expression.Index.currentIndexedDimension;
//                     return Expression.createAndEvaluate(arg);
//                 });
//             }


//             this.value = MatrixIndex.instance(this.receiver.value, this.args.map(function(a){
//                 return a.value === "colon" ? a.value : a.value.matrixValue();
//             }));

//             // set indexed matrix back to what it was
//             Expression.Index.currentIndexedVariable = oldIndexedMatrix;
//             Expression.Index.currentIndexedDimension = 0;

//             return this.value;
//         }
//         else{
// //            else if (this.functions.hasOwnProperty(receiver.identifier)) {
//             // Then try functions
//             assert(false, "Sorry, functionality not implemented yet.");
//         }
//     },

//     visualize_html : function(elem) {
//         var wrapper = $("<div></div>");
//         wrapper.addClass("matlab-exp-index");


//         var valueElem = $("<div></div>");
//         this.value.visualize_html(valueElem);
//         wrapper.append(valueElem);

//         var nameElem = $("<div></div>");
//         nameElem.addClass("matlab-identifier-name");
//         nameElem.html(this.receiver.value.name);
//         wrapper.append(nameElem);


//         elem.append(wrapper);
//     }
// });

// Expression.Colon = Expression.extend({
//     _name: "Expression.Colon",

//     evaluate : function() {
//         this.value = "colon";
//         return this.value;
//     }
// });

class LiteralExpression extends Expression {

    public constructor(ast: ASTNode) {
        super(ast);
    }

    public evaluate() {
        this.setValue(Matrix.scalar(this.ast["value"], "int"));
        return this.value;
    }

    public visualize_html(elem: JQuery, options?: {[index:string]: any}) {
        if (options && options.contained) {
            // TODO: clean this up, remove non-null assertion on this.value! if possible
            let temp = $("<div></div>");
            temp.addClass("matlab-scalar");
            var tempSpan = $("<span></span>");
            var num = Matrix.formatNumber(this.value!.scalarValue());
            if (num.length > 3) {
                temp.addClass("double");
            }
            tempSpan.html(num);
            temp.append(tempSpan);
            elem.append(temp);
        }
        else {
            this.value!.visualize_html(elem);
        }
    }
}

// TODO: reserved words can't be used as identifiers
class IdentifierExpression extends Expression {

    public readonly name: string;

    public constructor(ast: ASTNode) {
        super(ast);
        this.name = ast["identifier"];
    }

    public evaluate() {
        let env = Environment.global;
        if (env.hasVar(this.name)) {
            this.setValue(env.getVar(this.name).value);
        }
        else {
            throw {message: "Cannot find variable " + this.name};
        }
    }

    public visualize_html(elem: JQuery) {
        let wrapper = $("<div></div>");
        wrapper.addClass("matlab-identifier");


        let valueElem = $("<div></div>");
        this.value!.visualize_html(valueElem);
        wrapper.append(valueElem);

        var nameElem = $("<div></div>");
        nameElem.addClass("matlab-identifier-name");
        nameElem.html(this.name);
        wrapper.append(nameElem);


        elem.append(wrapper);
    }
}

// Expression.End = Expression.extend({
//     _name: "Expression.End",

//     evaluate : function() {

//         // grab matrix that is currently being indexed
//         var indexedMatrix = Expression.Index.currentIndexedVariable.getValue();

//         if(!indexedMatrix) {
//             throw {message: "end keyword is only allowed within the context of an indexing expression."};
//         }

//         this.value = Matrix.scalar(indexedMatrix.length(Expression.Index.currentIndexedDimension), "int");
//         return this.value;
//     }
// });



// TODO: just typing an identifier should not change ans
var processAns = function(result) {
    var ansElem = $("#ansVisualization");
    if (result && result.matrixValue) {
        var mat = result.matrixValue();
        CodeConstruct.getEnvironment().setVar("ans", mat);
        ansElem.empty();

        var wrapper = $("<div></div>");
        wrapper.addClass("matlab-assignment");
        wrapper.append("ans");

        wrapper.append("&nbsp;=&nbsp;");

        var rhsElem = $("<div></div>");
        mat.visualize_html(rhsElem);
        wrapper.append(rhsElem);

        ansElem.append(wrapper);

        ansElem.show();
    }
    else{
        ansElem.hide();
    }
};

function initializeExamples(){

    var examples = [];

    $(".matlab-example-exp").each(function(){

        var srcElem = $(this).find(".matlab-example-src");
        var vis = $(this).find(".matlab-example-vis");

        var updateExample = function () {
            var text = srcElem.val().trim();
            vis.empty();
            try{
                if (text.length > 0){
                    var srcText = MATLAB_PARSER.parse(text);
//                    visualize(exp, $("#visualization"));
                    var cc = CodeConstruct.instance(srcText);
                    var result = cc.evaluate();
                    cc.visualize_html(vis);
                    processAns(result);
                }
            }
            catch(err) {
                if (err.visualize_html) {
                    err.visualize_html(vis);
                }
                else{
                    vis.html(err.message);
                }
            }
        };

        var exp_in_timeout;
        srcElem.keypress(function (e) {
            var code = e.keyCode || e.which;
            if(code != 13) { //Enter keycode
                return;
            }
            e.preventDefault();
            var delay = 500; // ms
            clearTimeout(exp_in_timeout);
            exp_in_timeout = setTimeout(updateExample, delay)
            return false;
        });

        examples.push({
            srcElem: srcElem,
            visElem: vis,
            update: updateExample
        });
    });

    for(var i = 0; i < examples.length; ++i) {
        examples[i].update();
    }


}
