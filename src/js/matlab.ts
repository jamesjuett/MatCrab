import { Mutable, Color, assert } from "./util/util";






export interface Visualizable {
    visualize_html(containingElem: JQuery, options?: {[index:string]: any}) : void
}

export type DataType = "int" | "double" | "logical";

export abstract class MatrixHistory implements Visualizable {

    public readonly color = Color.randomColor();

    public abstract visualize_html(containingElem: JQuery) : void;
}

export class MatlabError {
    public readonly message: string;
    public readonly construct: CodeConstruct;

    public constructor(construct: CodeConstruct, message: string) {
        this.message = message;
        this.construct = construct;
    }
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

    public static scalar(value: number, dataType: DataType) {
        return new Matrix(1, 1, [value], dataType);
    }
    


    public readonly rows: number;
    public readonly cols: number;
    public readonly height: number;
    public readonly width: number;
    public readonly numel: number;
    public readonly dataType: DataType;

    public readonly isScalar: boolean;
   
    public readonly color: string;

    public readonly data: readonly number[];

    public constructor(rows: number, cols: number, data: number[], dataType: DataType) {
        this.rows = rows;
        this.cols = cols;
        this.height = rows;
        this.width = cols;
        this.numel = rows * cols;
        this.data = data;
        this.dataType = dataType;

        this.isScalar = rows === 1 && cols === 1;
        // this.history = history || MatrixHistory.Raw.instance(this);

        this.color = Color.toColor([this.rows, this.height, this.data], Color.LIGHT_LETTERS);
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
        (<number[]>this.data)[index - 1] = value;
    }

    public at(row: number, col: number) {
        row = row - 1;
        col = col - 1;
        return this.data[col * this.rows + row]
    }

    public setAt(row: number, col: number, value: number) {
        row = row - 1;
        col = col - 1;
        (<number[]>this.data)[col * this.rows + row] = value;
    }

    public length(dimension: 1 | 2) {
        if (dimension === 1) {
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
                tempSpan.html(Matrix.formatNumber(this.at(r,c)));
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

export class Variable {

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

export class Environment {

    public static readonly global : Environment;
    public static setGlobalEnvironment(elem: JQuery) {
        (<Environment>Environment.global) = new Environment(elem);
    }

    private readonly elem : JQuery;
    private readonly vars : {[index:string] : Variable } = {}
    private readonly endValueStack : number[] = [];

    public constructor (elem: JQuery) {
        this.elem = elem;
    }

    public hasVar(name : string) {
        return this.vars.hasOwnProperty(name);
    }

    public getVar(name: string) : Variable | undefined {
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

    public pushEndValue(value: number) {
        this.endValueStack.push(value);
    }

    public popEndValue() {
        this.endValueStack.pop();
    }
}

export type ASTNode = any;

export abstract class CodeConstruct {


    // TODO: move somewhere appropriate
    public static createRedX() {
        return $('<svg class="matlab-error-svg"><line x1="-20" y1="80%" x2="100%" y2="20%" style="stroke:rgba(255,0,0, 0.3);stroke-width:5" transform="translate(10,0)"></line><line style="stroke:rgba(255,0,0, 0.3);stroke-width:5" y2="80%" x2="100%" y1="20%" x1="-20" transform="translate(10,0)"></line></svg>');
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

    public abstract execute(): void;
    public abstract visualize_html(elem: JQuery, options?: {[index:string]: any}): void;

}

export class Assignment extends CodeConstruct {
    
    public readonly rhs: Expression;
    public readonly lhs: IdentifierExpression;

    constructor(ast: ASTNode) {
        super(ast);
        this.rhs = Expression.create(ast["exp"]);
        this.lhs = <IdentifierExpression>Expression.create(ast["identifier"])
    }

    public execute() {

        let rhsResult = this.rhs.execute();

        if (rhsResult.kind !== "success") {
            return;
        }

        let env = Environment.global;
        let name = this.lhs.name;

        env.setVar(name, rhsResult.value);

        this.lhs.execute(); // HACK: ensure lhs knows about new value
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

export type ExpressionValue = Matrix;

export type ExpressionState = "unexecuted" | "success" | "error";

export interface UnexecutedExpressionResult {
    readonly kind: "unexecuted";
}

export interface SuccessExpressionResult {
    readonly kind: "success";
    readonly value: ExpressionValue;
}

export interface ErrorExpressionResult {
    readonly kind: "error";
    readonly error: MatlabError;
}

export interface SubexpressionErrorExpressionResult {
    readonly kind: "subexpressionError";
    readonly error: MatlabError;
}

const UNEXECUTED : {kind: "unexecuted"} = {kind: "unexecuted"};

export function allSuccess(results: ExecutedExpressionResult[]): results is SuccessExpressionResult[] {
    return results.every(r => r.kind === "success");
}

function successResult(value: ExpressionValue) : SuccessExpressionResult {
    return {
        kind: "success",
        value: value
    };
}

function errorResult(error: MatlabError) : ErrorExpressionResult {
    return {
        kind: "error",
        error: error
    };
}

export type ExpressionResult = UnexecutedExpressionResult | SuccessExpressionResult | ErrorExpressionResult;

type ExecutedExpressionResult = SuccessExpressionResult | ErrorExpressionResult;

export abstract class Expression extends CodeConstruct {

    public readonly result: ExpressionResult = UNEXECUTED;

    public static create(ast: ASTNode) {
        return this.grammarToSubclass[ast["what"]](ast);
    }

    // Map from "what" key in src generated by grammar to
    // the name of the subclass in the code.
    // TODO: Revise to use factory pattern or abstract factory pattern?
    private static grammarToSubclass : {[index: string]: (a: ASTNode) => Expression} = {
        "matrix_exp": (a:ASTNode) => new MatrixExpression(a),
        "row_exp": (a:ASTNode) => new RowExpression(a),
        "range_exp": (a:ASTNode) => new RangeExpression(a),
        "or_exp": (a:ASTNode) => new MatrixOrExpression(a),
        "and_exp": (a:ASTNode) => new MatrixAndExpression(a),
        "eq_exp": (a:ASTNode) => new EqualityExpression(a),
        "rel_exp": (a:ASTNode) => new RelationalExpression(a),
        "add_exp": (a:ASTNode) => new AddExpression(a),
        "mult_exp": (a:ASTNode) => new MultExpression(a),
        "unary_exp": (a:ASTNode) => new UnaryOperatorExpression(a),
        // "postfix_exp": PostfixExpression,
        // "call_exp": CallExpression,
        // "colon_exp": ColonExpression,
        // "end_exp": EndExpression,
        "integer": (a:ASTNode) => new LiteralExpression(a),
        "float": (a:ASTNode) => new LiteralExpression(a),
        "identifier": (a:ASTNode) => new IdentifierExpression(a)
    }

    private setResult(result: ExecutedExpressionResult) {
        (<Mutable<this>>this).result = result;
    }

    // TODO: probably remove this. exceptions undesirable here
    // public requireValue() {
    //     if (this.result.kind === "success") {
    //         return this.result.value;
    //     }
    //     else if (this.result.kind === "error") {
    //         throw this.result.error;
    //     }
    //     else {
    //         throw this.result;
    //     }
    // }

    public execute() : ExecutedExpressionResult{
        let res = this.evaluate();
        this.setResult(res);
        return res;
    }

    protected abstract evaluate() : ExecutedExpressionResult;

    public visualize_html(elem: JQuery, options?: {[index:string]: any}) {
        var top = $('<div></div>').appendTo(elem);
        let expr = $('<div class="matlab-exp"></div>').appendTo(top);
        this.visualize_expr(expr, options);
        
        if (this.result.kind === "error" && this.result.error.construct === this) {
            expr.append(CodeConstruct.createRedX());

            var bottom = $("<div></div>");
            bottom.addClass("matlab-exp-bottom");
            var errElem = $("<div></div>");
            errElem.addClass("matlab-exp-error");
            errElem.html(this.result.error.message);
            bottom.append(errElem);
            elem.append(bottom);
        }
    }

    protected abstract visualize_expr(elem: JQuery, options?: {[index:string]: any}): void;

}

class MatrixExpression extends Expression {

    public readonly rows: readonly Expression[];

    public constructor(ast: ASTNode) {
        super(ast);
        this.rows = ast["rows"].map((r:any) => Expression.create(r));
    }

    protected evaluate() {

        let rowResults = this.rows.map(r => r.execute());
        if (allSuccess(rowResults)){
            return this.append_rows(rowResults.map(r => r.value));
        }
        else {
            return rowResults.find(r => {return r.kind !== "success";})!;
        }

    }

    private append_rows(mats: Matrix[]) : ExecutedExpressionResult {
        var newCols : number[][] = [];
        var cols = mats[0].cols;
        var newRows = 0;
        for(var i = 0; i < cols; ++i) {
            newCols.push([]);
        }
        for(var i = 0; i < mats.length; ++i) {
            var mat = mats[i];
            newRows += mat.rows;
            if (mat.cols !== cols) {
                return errorResult(new MatlabError(this, "Mismatched matrix number of columns."));
            }
            for(var c = 0; c < cols; ++c) {
                for(var r = 0; r < mat.rows; ++r) {
                    newCols[c].push(mat.at(r+1, c+1));
                }
            }
        }
        var newData = (<Array<number>>[]).concat.apply([], newCols);
        return successResult(new Matrix(newRows, cols, newData,
            mats.some(m => m.dataType === "double") ? "double" : mats[0].dataType));
    }

    public visualize_expr(elem: JQuery) {
        var table = $("<table></table>");
        table.addClass("matlab-table");
        let color = Color.WHITE;
        if (this.result.kind === "success") {
            color = this.result.value.color;
        }
        table.css("background-color", color);

        var rows = this.rows;
        for (var i = 0; i < rows.length; ++i) {
            var tr = $("<tr></tr>");
            table.append(tr);
            var td = $("<td></td>");
            tr.append(td);
            rows[i].visualize_html(td, {contained: true});
        }
        elem.append(table);
    }
}

class RowExpression extends Expression {
    
    public readonly cols: readonly Expression[];

    public constructor(ast: ASTNode) {
        super(ast);
        this.cols = ast["cols"].map((r:any) => Expression.create(r));
    }

    protected evaluate() {
        let colResults = this.cols.map(c => c.execute());

        if (allSuccess(colResults)) {
            return this.append_cols(colResults.map(c => c.value));
        }
        else {
            return colResults.find(r => {return r.kind !== "success";})!;
        }
    }

    private append_cols(mats: Matrix[]) : ExecutedExpressionResult {
        var rows = mats[0].rows;

        if (mats.some(m => {return m.rows != rows})) {
            return errorResult(new MatlabError(this, "Mismatched matrix number of rows."));
        }

        return successResult(new Matrix(
            mats[0].rows,
            mats.reduce(function(prev, current){
                return prev + current.cols;
            },0),
            mats.reduce(function(newData, mat){
                newData = newData.concat(mat.data);
                return newData;
            }, <Array<number>>[]),
            mats.some(m => m.dataType === "double") ? "double" : mats[0].dataType
        ));
    }

    public visualize_expr(elem: JQuery) {
        var cols = this.cols;
        if (cols.length == 1) {
            // Single element row - just visualize the element, not as a row
            cols[0].visualize_html(elem);
        }
        else {
            var table = $("<table></table>");
            table.addClass("matlab-table");
            let color = Color.WHITE;
            if (this.result.kind === "success") {
                color = this.result.value.color;
            }
            table.css("background-color", color);
            var tr = $("<tr></tr>");
            table.append(tr);

            for (var i = 0; i < cols.length; ++i) {
                var td = $("<td></td>");
                tr.append(td);
                var col = cols[i];
                cols[i].visualize_html(td,{contained: true});
            }
            elem.append(table);
        }
    }
}

class RangeExpression extends Expression {

    public readonly start: Expression;
    public readonly end: Expression;
    public readonly step: Expression | null;

    public constructor(ast: ASTNode) {
        super(ast);
        this.start = Expression.create(ast.start);
        this.end = Expression.create(ast.end);
        this.step = ast.step ? Expression.create(ast.step) : null;
    }

    protected evaluate() {

        let startResult = this.start.execute();
        let endResult = this.end.execute();
        let stepResult = this.step && this.step.execute();
    
        if (startResult.kind !== "success") {
            return startResult;
        }

        if (endResult.kind !== "success") {
            return endResult;
        }

        if (stepResult && stepResult.kind !== "success") {
            return stepResult;
        }

        // Note: MATLAB will actually accept non-scalar values for the subexpressions
        //       in range notation. It just grabs the first linear element, which is the
        //       behavior of .scalarValue() here.
        let x = startResult.value.scalarValue();
        let end = endResult.value.scalarValue();
        let step = stepResult ? stepResult.value.scalarValue() : 1;
        let range = <Array<number>>[];
        if (step > 0) { // positive step
            if (x <= end) { // start < end
                while (x <= end) {
                    range.push(x);
                    x += step;
                }
            }
        }
        else { // negative step
            if (end <= x) { // end <= x
                while (end <= x) {
                    range.push(x);
                    x += step
                }
            }
        }

        // TODO: check on type of ranges in MATLAB
        return successResult(new Matrix(1, range.length, range, "double"));
    }

    public visualize_expr(elem: JQuery) {
        elem.addClass("matlab-range");
        let explanationElem = $('<table class="matlab-table"></table>').appendTo($('<div class="matlab-range-header"></div>').appendTo(elem));
        let header = $("<tr></tr>").appendTo(explanationElem);
        header.append($("<th>start</th>"));
        this.step && header.append($("<th>step</th>"));
        header.append($("<th>end</th>"));
        
        let components = $("<tr></tr>").appendTo(explanationElem);
        this.start.visualize_html($("<td></td>").appendTo(components));
        this.step && this.step.visualize_html($("<td></td>").appendTo(components));
        this.end.visualize_html($("<td></td>").appendTo(components));


        var table = $('<table class="matlab-table"></table>').appendTo($('<div class="matlab-range-result" ></div>').appendTo(elem));
        table.append('<svg class="matlab-range-svg"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refx="9" refy="3" orient="auto" markerUnits="strokeWidth"> <path d="M0,0 L0,6 L9,3 z" fill="#000" /> </marker> </defs><g transform="translate(-10,0)"><line x1="22" y1="25" x2="100%" y2="25" stroke="#000" stroke-width="1" marker-end="url(#arrow)" /></g> </svg>');
        // table.addClass("matlab-range");

        var tr = $("<tr></tr>").appendTo(table);

        if (this.result.kind === "success"){
            let value = this.result.value;
            table.css("background-color", Color.toColor(value, Color.LIGHT_LETTERS));
            

            for (var i = 1; i <= value.numel; ++i) {
                var td = $("<td></td>");
                tr.append(td);

                // NOTE: The numbers themselves in a range are calculated and thus
                //       have a history, although in the future it may be useful to
                //       somehow show the history of the start, step, and end.
    //                    range[i].visualize_html(td);
                var temp = $("<div></div>");
                temp.addClass("matlab-scalar");
                var tempSpan = $("<span></span>");
                var num = Matrix.formatNumber(value.atLinear(i));
                if (num.length > 3) {
                    temp.addClass("double");
                }
                tempSpan.html(num);
                temp.append(tempSpan);
                td.append(temp);
            }
        }

    }
}

abstract class BinaryOperatorExpression extends Expression {

    public readonly left: Expression;
    public readonly right: Expression;
    public readonly op: string;

    public constructor(ast: ASTNode) {
        super(ast);
        this.op = ast.op;

        this.left = Expression.create(ast.left);
        this.right = Expression.create(ast.right);
    }

    protected abstract readonly dataType: DataType;
    protected abstract readonly operators: {[index: string]: (left:number, right:number) => number};

    protected evaluate() {

        let leftResult = this.left.execute();
        let rightResult = this.right.execute();

        if (leftResult.kind !== "success") {
            return leftResult;
        }

        if (rightResult.kind !== "success") {
            return rightResult;
        }

        let operandError = this.checkOperands(leftResult, rightResult);
        if (operandError) {
            return operandError;
        }

        return this.binaryOp(
            leftResult.value, rightResult.value, this.op,
            this.operators[this.op], this.dataType);
    }

    protected checkOperands(leftResult: SuccessExpressionResult, rightResult: SuccessExpressionResult) : ErrorExpressionResult | null {
        return null;
    }

    private binaryOp(leftMat: Matrix, rightMat: Matrix, op: string,
        operate : (left:number, right:number) => number, dataType: DataType) : ExecutedExpressionResult {

        let newData = [];
        let numRows;
        let numCols;
        if (leftMat.rows === rightMat.rows && leftMat.cols === rightMat.cols) {
            // Same dimensions (also covers both scalars)
            for (let i = 1; i <= leftMat.numel; ++i) {
                newData.push(operate(leftMat.atLinear(i), rightMat.atLinear(i)));
            }
            numRows = leftMat.rows;
            numCols = leftMat.cols;
        }
        else if (leftMat.isScalar) {
            let leftScalar = leftMat.scalarValue();
            for (let i = 1; i <= rightMat.numel; ++i) {
                newData.push(operate(leftScalar, rightMat.atLinear(i)));
            }
            numRows = rightMat.rows;
            numCols = rightMat.cols;
        }
        else if (rightMat.isScalar) {
            let rightScalar = rightMat.scalarValue();
            for (let i = 1; i <= leftMat.numel; ++i) {
                newData.push(operate(leftMat.atLinear(i), rightScalar));
            }
            numRows = leftMat.rows;
            numCols = leftMat.cols;
        }
        else{
            return errorResult(new MatlabError(this, "Mismatched dimensions for operator " + op + ". LHS is a " +
            leftMat.rows + "x" + leftMat.cols + " and RHS is a " +
            rightMat.rows + "x" + rightMat.cols + "."));
        }
        return successResult(new Matrix(numRows, numCols, newData, dataType));
    }


    public visualize_expr(elem: JQuery) {
        elem.addClass("matlab-exp-binaryOp");
        var leftElem = $("<div></div>");
        this.left.visualize_html(leftElem);
        elem.append(leftElem);

        var opElem = $("<div></div>");
        opElem.html("&nbsp;" + this.op + "&nbsp;");
        elem.append(opElem);

        var rightElem = $("<div></div>");
        this.right.visualize_html(rightElem);
        elem.append(rightElem);
    }
}

class AddExpression extends BinaryOperatorExpression {
    protected readonly dataType = "double";
    protected readonly operators = {
        "+" : (a: number, b: number) => a + b,
        "-" : (a: number, b: number) => a - b,
    }
}

class MultExpression extends BinaryOperatorExpression {
    protected readonly dataType = "double";
    protected readonly operators = {
        "*" : (a: number, b: number) => a * b,
        "/" : (a: number, b: number) => a / b,
        ".*" : (a: number, b: number) => a * b,
        "./" : (a: number, b: number) => a / b,
        ".^" : (a: number, b: number) => Math.pow(a,b)
    }

    protected checkOperands(leftResult: SuccessExpressionResult, rightResult: SuccessExpressionResult) {
        if (this.op === "*" || this.op === "/" || this.op === "^") {
            // One must be a scalar, otherwise it's matrix multiplication which is not supported.
            if (!leftResult.value.isScalar && !rightResult.value.isScalar) {
                return errorResult(new MatlabError(this, "Sorry, matrix multiplication, division, and exponentiation " +
                 "are not supported. You may use the element-wise versions (i.e. .*, ./, .^)."));
            }
        }
        return null;
    }
}

class MatrixOrExpression extends BinaryOperatorExpression {
    
    protected readonly dataType = "logical";
    protected readonly operators = {
        "|" : (a: number, b: number) => (a || b) ? 1 : 0
    }
}

class MatrixAndExpression extends BinaryOperatorExpression {

    protected readonly dataType = "logical";
    protected readonly operators = {
        "&" : (a: number, b: number) => (a && b) ? 1 : 0
    }
}

class EqualityExpression extends BinaryOperatorExpression {

    protected readonly dataType = "logical";
    protected readonly operators = {
        "==" : (a: number, b: number) => (a === b) ? 1 : 0,
        "~=" : (a: number, b: number) => (a !== b) ? 1 : 0
    }
}

class RelationalExpression extends BinaryOperatorExpression {

    protected readonly dataType = "logical";
    protected readonly operators = {
        "<" : (a: number, b: number) => (a < b) ? 1 : 0,
        "<=" : (a: number, b: number) => (a <= b) ? 1 : 0,
        ">" : (a: number, b: number) => (a > b) ? 1 : 0,
        ">=" : (a: number, b: number) => (a >= b) ? 1 : 0
    }
}

export type UnaryOperator = "+" | "-" | "~";

export class UnaryOperatorExpression extends Expression {

    public readonly operand: Expression;
    public readonly op: UnaryOperator;

    public constructor(ast: ASTNode) {
        super(ast);
        this.op = ast.op;

        this.operand = Expression.create(ast.left);
    }

    private readonly operators : {[op in UnaryOperator]: (n:number) => number} = {
        "+" : (x: number) => x,
        "-" : (x: number) => -x,
        "~" : (x: number) => x ? 0 : 1
    };

    private readonly operatorDataTypes :  {[op in UnaryOperator]: DataType} = {
        "+" : "double",
        "-" : "double",
        "~" : "logical"
    };

    protected evaluate() {

        let operandResult = this.operand.execute();

        if (operandResult.kind !== "success") {
            return operandResult;
        }

        let operandError = this.checkOperand(operandResult);
        if (operandError) {
            return operandError;
        }

        return this.unaryOp(operandResult.value, this.operators[this.op], this.operatorDataTypes[this.op]);
    }

    protected checkOperand(operandResult: SuccessExpressionResult) : ErrorExpressionResult | null {
        return null;
    }

    private unaryOp(mat: Matrix, operate : (n:number) => number, dataType:DataType) {
        return successResult(new Matrix(mat.rows, mat.cols, mat.data.map(operate), dataType));
    }

    public visualize_expr(elem: JQuery) {
        var wrapper = $("<div></div>");
        wrapper.addClass("matlab-exp-unaryOp");

        var opElem = $("<div></div>");
        opElem.html(this.op + "&nbsp;");
        wrapper.append(opElem);

        var subElem = $("<div></div>");
        this.operand.visualize_html(subElem);
        wrapper.append(subElem);

        elem.append(wrapper);
    }
}


// TODO: if indexed matrix is modified, should still show original version
class IndexExpression extends Expression {

    // currentIndexedVariable : null
    // currentIndexedDimension : 0,
    
    public readonly targetName: string;
    public readonly indicies: readonly Expression[];

    public constructor(ast: ASTNode) {
        super(ast);
        // TODO: may be nice to change grammar here to not have a nested identifier
        this.targetName = ast["receiver"]["identifier"];
        this.indicies = ast["args"].map((i:ASTNode) => Expression.create(i));
    }

    protected evaluate() {
        let vari = Environment.global.getVar(this.targetName);
        if (!vari) {
            return errorResult(new MatlabError(this, "Sorry, I can't find a variable or function named " + this.targetName));
        }

        let target = vari.value;

        assert(this.indicies.length <= 2, "More than 2D indexing not currently supported"); 
        let indicesResults = this.indicies.map((index, i) => {
            Environment.global.pushEndValue(target.length(<1|2>(i+1)));
            index.execute();
            Environment.global.popEndValue();
        });

        return MatrixIndex.instance(this.receiver.value, this.args.map(function(a){
            return a.value === "colon" ? a.value : a.value.matrixValue();
        }));

    }

    visualize_html : function(elem) {
        var wrapper = $("<div></div>");
        wrapper.addClass("matlab-exp-index");


        var valueElem = $("<div></div>");
        this.value.visualize_html(valueElem);
        wrapper.append(valueElem);

        var nameElem = $("<div></div>");
        nameElem.addClass("matlab-identifier-name");
        nameElem.html(this.receiver.value.name);
        wrapper.append(nameElem);


        elem.append(wrapper);
    }
});

// Expression.Colon = Expression.extend({
//     _name: "Expression.Colon",

//     evaluate : function() {
//         this.value = "colon";
//         return this.value;
//     }
// });

export class LiteralExpression extends Expression {

    private readonly literalValue : Matrix;
    
    public constructor(ast: ASTNode) {
        super(ast);
        this.literalValue = Matrix.scalar(this.ast["value"], "double");
    }

    protected evaluate() {
        return successResult(this.literalValue);
    }

    public visualize_expr(elem: JQuery, options?: {[index:string]: any}) {

        if (options && options.contained) {
            // TODO: clean this up, remove non-null assertion on this.value! if possible
            let temp = $("<div></div>");
            temp.addClass("matlab-scalar");
            var tempSpan = $("<span></span>");
            var num = Matrix.formatNumber(this.literalValue.scalarValue());
            if (num.length > 3) {
                temp.addClass("double");
            }
            tempSpan.html(num);
            temp.append(tempSpan);
            elem.append(temp);
        }
        else {
            this.literalValue.visualize_html(elem);
        }
    }
}

// TODO: reserved words can't be used as identifiers
export class IdentifierExpression extends Expression {

    public readonly name: string;

    public constructor(ast: ASTNode) {
        super(ast);
        this.name = ast["identifier"];
    }

    protected evaluate() {
        let env = Environment.global;
        if (env.hasVar(this.name)) {
            return successResult(env.getVar(this.name).value);
        }
        else {
            return errorResult(new MatlabError(this, "Cannot find variable " + this.name));
        }
    }

    public visualize_expr(elem: JQuery) {
        let wrapper = $("<div></div>");
        wrapper.addClass("matlab-identifier");


        if (this.result.kind === "success") {
            let valueElem = $("<div></div>");
            this.result.value && this.result.value.visualize_html(valueElem);
            wrapper.append(valueElem);
        }

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
// var processAns = function(result) {
//     var ansElem = $("#ansVisualization");
//     if (result && result.matrixValue) {
//         var mat = result.matrixValue();
//         CodeConstruct.getEnvironment().setVar("ans", mat);
//         ansElem.empty();

//         var wrapper = $("<div></div>");
//         wrapper.addClass("matlab-assignment");
//         wrapper.append("ans");

//         wrapper.append("&nbsp;=&nbsp;");

//         var rhsElem = $("<div></div>");
//         mat.visualize_html(rhsElem);
//         wrapper.append(rhsElem);

//         ansElem.append(wrapper);

//         ansElem.show();
//     }
//     else{
//         ansElem.hide();
//     }
// };

// function initializeExamples(){

//     var examples = [];

//     $(".matlab-example-exp").each(function(){

//         var srcElem = $(this).find(".matlab-example-src");
//         var vis = $(this).find(".matlab-example-vis");

//         var updateExample = function () {
//             var text = srcElem.val().trim();
//             vis.empty();
//             try{
//                 if (text.length > 0){
//                     var srcText = MATLAB_PARSER.parse(text);
// //                    visualize(exp, $("#visualization"));
//                     var cc = CodeConstruct.instance(srcText);
//                     var result = cc.evaluate();
//                     cc.visualize_html(vis);
//                     processAns(result);
//                 }
//             }
//             catch(err) {
//                 if (err.visualize_html) {
//                     err.visualize_html(vis);
//                 }
//                 else{
//                     vis.html(err.message);
//                 }
//             }
//         };

//         var exp_in_timeout;
//         srcElem.keypress(function (e) {
//             var code = e.keyCode || e.which;
//             if(code != 13) { //Enter keycode
//                 return;
//             }
//             e.preventDefault();
//             var delay = 500; // ms
//             clearTimeout(exp_in_timeout);
//             exp_in_timeout = setTimeout(updateExample, delay)
//             return false;
//         });

//         examples.push({
//             srcElem: srcElem,
//             visElem: vis,
//             update: updateExample
//         });
//     });

//     for(var i = 0; i < examples.length; ++i) {
//         examples[i].update();
//     }


// }
