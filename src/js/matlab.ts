import { Mutable, Color, assert, cloneArray, MatlabMath, asMutable } from "./util/util";
import { range } from "lodash";





type VisualizationOptions = {
    [index: string]: boolean | number | string;
}

export interface Visualizable {
    visualize_html(options?: VisualizationOptions) : string
}

export type DataType = "double" | "logical";

export class MatlabError {
    public readonly message: string;
    public readonly construct: CodeConstruct;

    public constructor(construct: CodeConstruct, message: string) {
        this.message = message;
        this.construct = construct;
    }
}

export class Matrix implements Visualizable {

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

    public static createSized(rows: number, cols: number, dataType: DataType) {
        return new Matrix(rows, cols, new Array(rows * cols), dataType);
    }
    

    public readonly numDims = 2;
    public readonly rows: number;
    public readonly cols: number;
    public readonly height: number;
    public readonly width: number;
    public readonly numel: number;
    public readonly dataType: DataType;

    public readonly isScalar: boolean;
    public readonly isVector: boolean;
   
    public readonly color: string;

    public readonly data: readonly number[];

    public constructor(rows: number, cols: number, data: readonly number[], dataType: DataType) {
        this.rows = rows;
        this.cols = cols;
        this.height = rows;
        this.width = cols;
        this.numel = rows * cols;
        this.data = cloneArray(data) // copy is important, since otherwise internal casting away of readonly on data could cause issues
        this.dataType = dataType;

        this.isScalar = rows === 1 && cols === 1;
        this.isVector = rows === 1 || cols === 1;

        this.color = Color.toColor([this.rows, this.height, this.data], Color.LIGHT_LETTERS);
    }

    public toString() : string {
        return "Rows: " + this.rows + " Cols: " + this.cols + "\nData: " + JSON.stringify(this.data);
    }

    public clone() : Matrix {
        // Note the .slice() copies the data array
        return new Matrix(this.rows, this.cols, this.data.slice(), this.dataType);
    }

    public equals(other: Matrix) : boolean {
        return this.width === other.width && this.height === other.height &&
               this.data.every((value, i) => value === other.data[i]);
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
        return this;
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
        return this;
    }

    public fill(value: number) {
        for(let i = 0; i < this.data.length; ++i) {
            (<number[]>this.data)[i] = value;
        }
        return this;
    }

    // REQUIRES: data has the same number of elements as the original matrix data
    public setAll(data: readonly number[]) {
        assert(this.data.length === data.length, "new data must have same number of elements");
        for(let i = 0; i < this.data.length; ++i) {
            (<number[]>this.data)[i] = data[i];
        }
        return this;
    }

    public operateAll(operate: (val: number) => number) {
        this.setAll(this.data.map(operate));
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

    public colData(col: number) : number[] {
        return this.data.slice((col-1) * this.rows, col * this.rows);
    }

    public setColData(col: number, newData: readonly number[]) {
        for(let r = 1, i = 0; r <= this.rows; ++r) {
            this.setAt(r, col, newData[i++]);
        }
    }

    public rowData(row: number) : number[] {
        return range(1, this.cols + 1).map((c) => this.at(row, c));
    }

    public setRowData(row: number, newData: readonly number[]) {
        for(let c = 1, i = 0; c <= this.cols; ++c) {
            this.setAt(row, c, newData[i++]);
        }
    }

    public accumulateCols(operate: (a:number, b:number) => number) {
        return new Matrix(1, this.cols,
            range(1, this.cols+1).map((c) => this.colData(c).reduce(operate)),
            "double");
    }
    
    public accumulateRows(operate: (a:number, b:number) => number) {
        return new Matrix(this.rows, 1,
            range(1, this.rows+1).map((c) => this.rowData(c).reduce(operate)),
            "double");
    }

    public visualize_html(options?: VisualizationOptions) : string {

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

        return table[0].outerHTML;
    }

}

abstract class Subarray {

    // public visualize_variable_selection(elem: JQuery, options?: VisualizationOptions) {
    //     let wrapper = $("<div></div>");
    //     wrapper.addClass("matlab-exp-index");


    //     let valueElem = $("<div></div>");
    //     this.visualize_selection(valueElem);
    //     wrapper.append(valueElem);

    //     let nameElem = $("<div></div>");
    //     nameElem.addClass("matlab-identifier-name");
    //     nameElem.html(this.variable.name);
    //     wrapper.append(nameElem);

    //     elem.append(wrapper);
    // }

    public abstract visualize_selection(matrix: Matrix) : string;

    // @throws {string} If the value cannot be determined (e.g. subarray specifies out-of-bound indices).
    public abstract readValue(source: Matrix) : Matrix;

    // TODO: remove?
    // public abstract readonly dimensions : readonly number[];

    // @throws {string} If assignment cannot be performed (e.g. due to a dimension mismatch).
    public abstract assign(target: Matrix, value: Matrix) : void;

    // @throws {string} If the subarray is not well-formed w.r.t its variable
    //                  (e.g. subarray specifies out-of-bound indices).
    public abstract verify(mat: Matrix) : void;
}

class CoordinateSubarray extends Subarray {

    public static create(rowIndices: Matrix | ":", colIndices: Matrix | ":") {
        return new CoordinateSubarray(
            CoordinateIndexer.create(1, rowIndices),
            CoordinateIndexer.create(2, colIndices));
    }

    public readonly rowIndexer: CoordinateIndexer;
    public readonly colIndexer: CoordinateIndexer;

    protected constructor(rowIndexer: CoordinateIndexer, colIndexer: CoordinateIndexer) {
        super();
        this.rowIndexer = rowIndexer;
        this.colIndexer = colIndexer;
    }

    public visualize_selection(matrix: Matrix) {
        var table = $("<table></table>");
        table.addClass("matlab-index");
        table.css("background-color", matrix.color);
        let rowIndicesSet = new Set(this.rowIndexer.getSelectedIndices(matrix));
        let colIndicesSet = new Set(this.colIndexer.getSelectedIndices(matrix));
        for (var r = 1; r <= matrix.rows; ++r) {
            var tr = $("<tr></tr>");
            table.append(tr);
            for (var c = 1; c <= matrix.cols; ++c) {
                let td = $("<td><div class='highlight'></div></td>");

                if (rowIndicesSet.has(r) &&
                    colIndicesSet.has(c)) {
                    td.addClass("selected");
                }

                var rawIndexElem = $("<div></div>");
                rawIndexElem.addClass("matlab-raw-index");
                rawIndexElem.html("" + matrix.linearIndex(r,c));
                td.append(rawIndexElem);

                var temp = $("<div></div>");
                temp.addClass("matlab-scalar");
                var tempSpan = $("<span></span>");
                tempSpan.html("" + matrix.at(r,c));
                temp.append(tempSpan);
                td.append(temp);
                tr.append(td);
            }
        }

        return table[0].outerHTML;
    }

    public readValue(source: Matrix) : Matrix {
        let data : number[] = [];

        let rowIndices = this.rowIndexer.getSelectedIndices(source);
        let colIndices = this.colIndexer.getSelectedIndices(source);

        // Extract selection in column-major order
        colIndices.forEach((selectedCol) => {
            rowIndices.forEach((selectedRow) => {
                data.push(source.at(selectedRow, selectedCol));
            })
        });

        return new Matrix(rowIndices.length,
            colIndices.length, data, source.dataType);
    }

    public assign(target: Matrix, value: Matrix) {
        
        let rowIndices = this.rowIndexer.getSelectedIndices(target);
        let colIndices = this.colIndexer.getSelectedIndices(target);
        let selectionRows = rowIndices.length;
        let selectionCols = colIndices.length;
        let selectionNumel = selectionRows * selectionCols;

        if (value.isScalar) {
            colIndices.forEach((selectedCol, c) => {
                rowIndices.forEach((selectedRow, r) => {
                    target.setAt(selectedRow, selectedCol, value.scalarValue());
                })
            });
        }
        // Normally, the dimensions of selection and value must match exactly, but
        // if the selection (not the target) and the value are both vectors, their
        // number of elements must be the same, but their dimensions might be different.
        // (e.g. you can assign a row vector to a column selection of the same length)
        else if (selectionRows === value.rows && selectionCols === value.cols ||
            ((selectionRows === 1 || selectionCols === 1) && value.isVector && selectionNumel == value.numel)) {
            let i = 1;
            colIndices.forEach((selectedCol, c) => {
                rowIndices.forEach((selectedRow, r) => {
                    // Note: expression below cannot use value.at(r + 1, c + 1) since this won't work
                    // for vectors that have rows/cols flipped
                    target.setAt(selectedRow, selectedCol, value.atLinear(i++));
                })
            });
        }
        else {
            throw "Subscripted assignment dimension mismatch. The left hand side indexing expression" +
            " selects a " + selectionRows + "x" + selectionCols + " while the right hand side is a " + value.rows + "x" + value.cols + ".";
        }
    }

    public verify(mat: Matrix) {
        this.rowIndexer.verify(mat);
        this.colIndexer.verify(mat);
    }

}

abstract class CoordinateIndexer {

    public static readonly DIMENSION_NAMES = ["", "row", "column"];

    public static create(dimension: 1 | 2, selectedIndices: Matrix | ":") {
        if (selectedIndices === ":") {
            return new AllCoordinateIndexer(dimension);
        }
        else if (selectedIndices.dataType === "logical") {
            return new LogicalCoordinateIndexer(dimension, selectedIndices);
        }
        else {
            return new RegularCoordinateIndexer(dimension, selectedIndices);
        }
    }

    public readonly dimension: 1 | 2;

    protected constructor(dimension: 1 | 2) {
        this.dimension = dimension;
    }

    public abstract getSelectedIndices(mat: Matrix) : readonly number[];

    public abstract verify(mat: Matrix) : void;

}

class RegularCoordinateIndexer extends CoordinateIndexer {

    private selectedIndices: readonly number[];

    public constructor(dimension: 1 | 2, selectedIndices: Matrix) {
        super(dimension);
        this.selectedIndices = selectedIndices.data
    }
    
    public getSelectedIndices(mat: Matrix): readonly number[] {
        return this.selectedIndices;
    }

    public verify(mat: Matrix) {
        let dimLen = mat.length(this.dimension);
        this.selectedIndices.forEach(index => {
            if (index < 1 || dimLen < index) {
                throw CoordinateIndexer.DIMENSION_NAMES[this.dimension] + " index " + index + " is out of bounds for the source matrix.";
            }
        });
    }

}

class AllCoordinateIndexer extends CoordinateIndexer {

    public constructor(dimension: 1 | 2) {
        super(dimension);
    }

    public getSelectedIndices(mat: Matrix): readonly number[] {
        return MatlabMath.range(1, mat.length(this.dimension));
    }

    public verify(mat: Matrix) {
        // always valid
    }

}

class LogicalCoordinateIndexer extends CoordinateIndexer {

    private readonly logicalSelection: Matrix;
    private readonly selectedIndices: readonly number[];

    public constructor(dimension: 1 | 2, logicalSelection: Matrix) {
        super(dimension);
        let selectedIndices : number[] = [];
        logicalSelection.data.forEach((logicalValue, i) => logicalValue && selectedIndices.push(i+1)); // i+1 to convert to MATLAB 1 based indexing
        this.selectedIndices = selectedIndices;
        this.logicalSelection = logicalSelection;
    }
    
    public getSelectedIndices(mat: Matrix): readonly number[] {
        return this.selectedIndices;
    }

    public verify(mat: Matrix) {
        // Check that the logical matrix is not larger than the relevant dimension
        let logicalLength = this.logicalSelection.numel;
        let dimLen = mat.length(this.dimension);
        if (logicalLength > dimLen) {
            throw "Logical index matrix to select " + CoordinateIndexer.DIMENSION_NAMES[this.dimension] +
            "s has " + logicalLength + " elements, but source matrix only has " + dimLen +
            CoordinateIndexer.DIMENSION_NAMES[this.dimension] + "s.";
        }
    }

}

abstract class LinearSubarray extends Subarray {

    public static create(indices: Matrix | ":") {
        if (indices === ":") {
            return new AllLinearSubarray();
        }
        else if (indices.dataType === "logical") {
            return new LogicalLinearSubarray(indices);
        }
        else {
            return new RegularLinearSubarray(indices);
        }
    }

}

class RegularLinearSubarray extends LinearSubarray {

    public readonly selectedIndices: Matrix;

    public constructor(indices: Matrix) {
        super();
        this.selectedIndices = indices;
    }
    
    public verify(mat: Matrix) {
        this.selectedIndices.data.forEach(index => {
            if (index < 1 || mat.numel < index) {
                throw "Index " + index + " is out of bounds for the source matrix.";
            }
        });
    }

    public readValue(source: Matrix) : Matrix {
        return new Matrix(
            this.selectedIndices.rows, this.selectedIndices.cols,
            this.selectedIndices.data.map(index => source.atLinear(index)),
            source.dataType
        );
    }
    
    public assign(target: Matrix, value: Matrix) {
        if (value.isScalar) {
            let s = value.scalarValue();
            this.selectedIndices.data.forEach(index => {
                target.setLinear(index, s);
            });
        }
        else if (this.selectedIndices.numel == value.numel) {
            this.selectedIndices.data.forEach((index, valueIndex) => {
                target.setLinear(index, value.atLinear(valueIndex));
            })
        }
        else{
            throw "The length of the RHS matrix (" + value.numel + ") does not match the" +
            " number of indices selected from the matrix on the LHS (" + this.selectedIndices.numel + ").";
        }
    }

    public visualize_selection(mat: Matrix) {
        var table = $("<table></table>");
        table.addClass("matlab-index");
        table.css("background-color", mat.color);
        let indicesSet = new Set(this.selectedIndices.data);
        for (var r = 1; r <= mat.rows; ++r) {
            var tr = $("<tr></tr>");
            table.append(tr);
            for (var c = 1; c <= mat.cols; ++c) {
                let td = $("<td><div class='highlight'></div></td>");

                if (indicesSet.has(mat.linearIndex(r, c))) {
                    td.addClass("selected");
                }

                var rawIndexElem = $("<div></div>");
                rawIndexElem.addClass("matlab-raw-index");
                rawIndexElem.html("" + mat.linearIndex(r,c));
                td.append(rawIndexElem);

                var temp = $("<div></div>");
                temp.addClass("matlab-scalar");
                var tempSpan = $("<span></span>");
                tempSpan.html("" + mat.at(r,c));
                temp.append(tempSpan);
                td.append(temp);
                tr.append(td);
            }
        }

        return table[0].outerHTML;
    }
}

class AllLinearSubarray extends LinearSubarray {

    public verify(mat: Matrix) {
        // Always valid
    }

    public readValue(source: Matrix) : Matrix {
        return new Matrix(source.numel, 1, source.data, source.dataType);
    }
    
    public assign(target: Matrix, value: Matrix) {
        if (value.isScalar) {
            target.fill(value.scalarValue());
        }
        else if (target.numel == value.numel) {
            target.setAll(value.data);
        }
        else{
            throw "The length of the RHS matrix (" + value.numel + ") does not match the" +
            " number of indices selected from the matrix on the LHS (" + target.numel + ").";
        }
    }

    public visualize_selection(mat: Matrix) {
        var table = $("<table></table>");
        table.addClass("matlab-index");
        table.css("background-color", mat.color);
        for (var r = 1; r <= mat.rows; ++r) {
            var tr = $("<tr></tr>");
            table.append(tr);
            for (var c = 1; c <= mat.cols; ++c) {
                let td = $("<td><div class='highlight'></div></td>");
                td.addClass("selected");

                var rawIndexElem = $("<div></div>");
                rawIndexElem.addClass("matlab-raw-index");
                rawIndexElem.html("" + mat.linearIndex(r,c));
                td.append(rawIndexElem);

                var temp = $("<div></div>");
                temp.addClass("matlab-scalar");
                var tempSpan = $("<span></span>");
                tempSpan.html("" + mat.at(r,c));
                temp.append(tempSpan);
                td.append(temp);
                tr.append(td);
            }
        }

        return table[0].outerHTML;
    }
}

class LogicalLinearSubarray extends LinearSubarray {

    public readonly logicalSelection: Matrix;
    public readonly selectedIndices: readonly number[];

    public constructor(logicalSelection: Matrix) {
        super();
        this.logicalSelection = logicalSelection;
        assert(logicalSelection.dataType === "logical");

        let selectedIndices : number[] = [];
        logicalSelection.data.forEach((logicalValue, i) => logicalValue && selectedIndices.push(i+1)); // i+1 to convert to MATLAB 1 based indexing
        this.selectedIndices = selectedIndices;
    }
    
    public verify(mat: Matrix) {
        // Check that the logical matrix is not larger than the one we're indexing
        let logicalLength = this.logicalSelection.numel;
        let matLength = mat.numel;
        if (logicalLength > matLength) {
            throw "Logical index matrix has " + logicalLength
            + " elements, but source matrix only has " + matLength + " elements.";
        }
    }

    public readValue(source: Matrix) : Matrix {
        let selectedData = this.selectedIndices.map(i => source.atLinear(i));

        if (this.logicalSelection.rows === 1) {
            // special case - if the logical index matrix is a row vector, result is shaped as a row vector
            return new Matrix(1, selectedData.length, selectedData, source.dataType);
        }
        else {
            // general case - shaped as a column vector
            return new Matrix(selectedData.length, 1, selectedData, source.dataType);
        }
    }
    
    public assign(target: Matrix, rhs: Matrix) {

        if (rhs.isScalar) {
            let scalarValue = rhs.scalarValue();
            this.selectedIndices.forEach(selectedIndex => target.setLinear(selectedIndex, scalarValue));
        }
        else if (this.selectedIndices.length === rhs.numel) {
            this.selectedIndices.forEach((selectedIndex, i) => target.setLinear(selectedIndex, rhs.data[i]));
        }
        else {
            throw "The number of elements in the RHS matrix (" + rhs.numel + ") does not match the" +
            " number of selected elements in the logically indexed matrix on the LHS (" + this.selectedIndices.length + ").";
        }
    }

    public visualize_selection(mat: Matrix) {
        var table = $("<table></table>");
        table.addClass("matlab-index");
        table.css("background-color", mat.color);
        let indicesSet = new Set(this.selectedIndices);
        for (var r = 1; r <= mat.rows; ++r) {
            var tr = $("<tr></tr>");
            table.append(tr);
            for (var c = 1; c <= mat.cols; ++c) {
                var td = $("<td><div class='highlight'></div></td>");
                let isSelected = indicesSet.has(mat.linearIndex(r, c));
                if (isSelected){
                    td.addClass("selected");
                }

                var logicalIndexElem = $("<div></div>");
                logicalIndexElem.addClass("matlab-raw-index");
                logicalIndexElem.html(isSelected ? "1" : "0");
                td.append(logicalIndexElem);

                var temp = $("<div></div>");
                temp.addClass("matlab-scalar");
                var tempSpan = $("<span></span>");
                tempSpan.html(""+mat.at(r,c));
                temp.append(tempSpan);
                td.append(temp);
                tr.append(td);
            }

        }

        return table[0].outerHTML;
    }
}

export class Variable implements Visualizable {

    public readonly name: string;
    public readonly value: Matrix;

    public readonly elem: JQuery;
    private readonly valueElem: JQuery;


    public constructor(name: string, value: Matrix) {
        this.name = name;
        this.value = value;

        this.elem = $('<li class="list-group-item"><span class="badge matlab-var-badge">' + name + '</span></li>')
            .prepend(this.valueElem = $('<span class="matlab-var-holder"></span>'));

        // Show initial value
        this.refresh();
    }

    public refresh() {
        var holder = this.elem.find(".matlab-var-holder");
        holder.empty();
        holder.html(this.value.visualize_html());
    }

    public setValue(value: Matrix) {
        (<Mutable<this>>this).value = value.clone();
        this.refresh();
    }

    // TODO: Remove?
    // matrixValue : function() {
    //     return this.value.matrixValue();
    // }

    visualize_html(options?: VisualizationOptions) : string {
        return this.value.visualize_html(options);
    }
}

type MatlabFunctionFuncType = (args: Matrix[], construct: CodeConstruct) => Matrix;

export class MatlabFunction {

    public static readonly ARGS_INF = -1;

    /**
     * 
     * @param numArgs The number of arguments required for the function. If a pair of numbers, specifies a
     *                range (inclusive) of the number of arguments allowed.
     * @param func A function that accepts the argument values passed into this MATLAB function and returns
     *             the value of the result from that function. (Note this is a Typescript function that
     *             essentially "fakes" the black-box behavior of the MATLAB function behind the scences.)
     */
    public constructor(public readonly numArgs: number | [number, number], private readonly func : MatlabFunctionFuncType) {}

    public operate(construct: CodeConstruct, args: Matrix[]) {
        try {
            return successResult(this.func(args, construct));
        }
        catch(msg) {
            return errorResult(new MatlabError(construct, msg));
        }
    }

    public isValidNumberOfArgs(n: number) {
        if (Array.isArray(this.numArgs)) {
            return this.numArgs[0] <= n && (n <= this.numArgs[1] || this.numArgs[1] === MatlabFunction.ARGS_INF);
        }
        else {
            return n === this.numArgs;
        }
    }

}

function createSizedMatrix(args: Matrix[]) {
    if (args.length === 0) {
        return new Matrix(1,1,[0],"double");
    }
    else if (args.length === 1) {
        let arg = args[0];
        if (arg.isScalar) {
            // A scalar is acceptable and produces a square matrix
            let size = arg.scalarValue();
            return new Matrix(size, size, new Array(size*size), "double");
        }
        else {
            // Otherwise, must be a row vector with real values
            if (arg.rows !== 1) {
                throw "The one-argument version of this function requires a numeric row vector as an input."
            }
            return new Matrix(arg.atLinear(1), arg.atLinear(2), new Array(arg.atLinear(1) * arg.atLinear(2)), "double");
        }
    }
    else if ( args.length === 2) {
        let numRows = args[0];
        let numCols = args[1];
        if (!numRows.isScalar) {
            throw "The argument for the number of rows must be a scalar.";
        }
        if (!numCols.isScalar) {
            throw "The argument for the number of columns must be a scalar.";
        }
        return new Matrix(numRows.scalarValue(), numCols.scalarValue(), new Array(numRows.scalarValue() * numCols.scalarValue()), "double");
    }
    else {
        throw "Sorry, MatCrab does not support matrices with more than two dimensions.";
    }
}


function matrixAccumulation(mat: Matrix, dimension: Matrix | undefined, operate: (a:number, b:number) => number) {
    let dim = 1; // default unless overwritten
    if (dimension) {
        if (!dimension.isScalar || dimension.scalarValue() < 1 || !Number.isInteger(dimension.scalarValue())) {
            throw "The second argument specifying the operation dimension must be a positive integer scalar.";
        }
        dim = dimension.scalarValue();
    } 

    
    // Special case: if a row/col vector, sum whole thing
    if (mat.isVector) {
        return new Matrix(1,1,[mat.data.reduce(operate)], "double"); // will coerce other numeric datatypes to double
    }

    if (dim === 1) {
        return mat.accumulateCols(operate);
    }
    else if (dim === 2) {
        return mat.accumulateRows(operate);
    }
    else {
        // Because MatCrab does not support more than two dimensional matrices,
        // sum with a dimension higher than 2 will always just return the original matrix
        return mat.clone();
    }
}

function matrixUnaryFunction(mat: Matrix, operate: (val:number) => number) {
    mat = mat.clone();
    mat.operateAll(operate);
    return mat;
}

// function matrixBinaryFunction(mat1: Matrix, mat2: Matrix, operate: (val1:number, val2: number) => number) {
//     mat = mat.clone();
//     mat.operateAll(operate);
//     return mat;
// }

function matrixFlipud(args: Matrix[]) {
    let orig = args[0];
    let newMat = orig.clone();
    for(let c = 1; c <= orig.cols; ++c) {
        // Iterate through original and fill new in backward fashion for each column
        for (let r_orig = 1, r_new = newMat.rows; r_orig <= orig.rows; ++r_orig, --r_new) {
            newMat.setAt(r_new, c, orig.at(r_orig, c));
        }
    }
    return newMat;
}

function matrixFliplr(args: Matrix[]) {
    let orig = args[0];
    let newMat = orig.clone();
    for(let r = 1; r <= orig.rows; ++r) {
        // Iterate through original and fill new in backward fashion for each row
        for (let c_orig = 1, c_new = newMat.cols; c_orig <= orig.cols; ++c_orig, --c_new) {
            newMat.setAt(r, c_new, orig.at(r, c_orig));
        }
    }
    return newMat;
}

function unsupportedMatlabFunction(name: string) {
    return (args: Matrix[]) => { throw `Sorry, MatCrab does not support the ${name} function.`; };
}

const MATLAB_FUNCTIONS : {[index: string]: MatlabFunction} = {
    "fliplr" : new MatlabFunction(1, matrixFliplr),
    "flipud" : new MatlabFunction(1, matrixFlipud),
    "flip" : new MatlabFunction([1,2], (args: Matrix[]) => {
        if (args.length === 1) {
            return matrixFlipud(args);
        }
        else {
            let dimension = args[1];
            if (!dimension.isScalar || dimension.scalarValue() < 1 || !Number.isInteger(dimension.scalarValue())) {
                throw "The second argument specifying the flip dimension must be a positive integer scalar.";
            }
            
            let dim = dimension.scalarValue();
            if (dim === 1) {
                return matrixFlipud(args);
            }
            else if (dim === 2) {
                return matrixFliplr(args);
            }
            else {
                // flipping along a higher dimension does nothing, since MatCrab only supports 2D matrices
                return args[0].clone();
            }
        }
    }),
    "rot90" : new MatlabFunction(1, (args: Matrix[]) => {
        let orig = args[0];
        let newMat = Matrix.createSized(orig.cols, orig.rows, "double");
        
        // last column becomes first row, 2nd to last column becomes 2nd row, etc.
        for(let c = orig.cols, r = 1; c >= 1; --c, ++r) {
            newMat.setRowData(r, orig.colData(c));
        }
        return newMat;
    }),
    "zeros" : new MatlabFunction([0,MatlabFunction.ARGS_INF], (args: Matrix[]) => createSizedMatrix(args).fill(0)),
    "ones" : new MatlabFunction([0,MatlabFunction.ARGS_INF], (args: Matrix[]) => createSizedMatrix(args).fill(1)),
    "eye" : new MatlabFunction([0,MatlabFunction.ARGS_INF], (args: Matrix[]) => {
        let mat = createSizedMatrix(args).fill(0);
        let diag_len = Math.min(mat.rows, mat.cols);
        for(let i = 1; i <= diag_len; ++i) {
            mat.setAt(i, i, 1);
        }
        return mat;
    }),
    "magic" : new MatlabFunction(1, (args: Matrix[]) => {
        let mat = createSizedMatrix(args);
        let n = mat.rows; // mat will be square with side length n
        if (n % 2 !== 0) {
    
            // de La Loubere's method for odd sizes. start in middle of top row,
            // move diagonally up/right to fill in n elements.
            // Then go down one, and repeat with a new diagonal. Do this for n diagonals.
    
            // Values range from 1 up through n^2, inclusive
            let val = 1;
    
            // use 0 based indices here, adjust when using setAt below
            let r = 0;
            let c = Math.floor(n/2);
            
            // Fill in n diagonals
            for (let d = 0; d < n; ++d) {
    
                // Each diagonal has length n
                for(let i = 0; i < n; ++i) {
                    mat.setAt(r + 1, c + 1, val++); // +1 to adjust to 1 based index
                    r = (r - 1 + n) % n; // move up, wrap if necessary
                    c = (c + 1 + n) % n; // move right, wrap if necessary
                    // (Note the extra "+ n" avoids negative numbers that would break the % operation)
                }
    
                // Drop down one after filling in each diagonal
                // There was an extra r - 1 and c + 1 earlier, so we also need to undo those,
                // meaning we want r + 2 and c - 1 to achieve a net of r + 1
                r = (r + 2 + n) % n;
                c = (c - 1 + n) % n;
    
            }
        }
        // The magic algorithm for even cases is more complicated, so let's just hardcode some for now.
        else if (n === 2) {
            mat.setAll([1,4,3,2]);
        }
        else if (n === 4) {
            mat.setAll([16,5,9,4,2,11,7,14,3,10,6,15,13,8,12,1]);
        }
        else if (n === 6) {
            mat.setAll([35,3,31,8,30,4,1,32,9,28,5,36,6,7,2,33,34,29,26,21,22,17,12,13,19,23,27,10,14,18,24,25,20,15,16,11]);
        }
        else if (n === 8) {
            mat.setAll([64,9,17,40,32,41,49,8,2,55,47,26,34,23,15,58,3,54,46,27,35,22,14,59,61,12,20,37,29,44,52,5,60,13,21,36,28,45,53,4,6,51,43,30,38,19,11,62,7,50,42,31,39,18,10,63,57,16,24,33,25,48,56,1]);
        }
        else if (n === 10) {
            mat.setAll([92,98,4,85,86,17,23,79,10,11,99,80,81,87,93,24,5,6,12,18,1,7,88,19,25,76,82,13,94,100,8,14,20,21,2,83,89,95,96,77,15,16,22,3,9,90,91,97,78,84,67,73,54,60,61,42,48,29,35,36,74,55,56,62,68,49,30,31,37,43,51,57,63,69,75,26,32,38,44,50,58,64,70,71,52,33,39,45,46,27,40,41,47,28,34,65,66,72,53,59]);
        }
        else {
            throw "Sorry, MatCrab does not support magic matrices of even size greater than size 10."
        }
        return mat;
    }),
    "numel" : new MatlabFunction(1, (args: Matrix[]) => Matrix.scalar(args[0].numel, "double")),
    "length" : new MatlabFunction(1, (args: Matrix[]) => Matrix.scalar(Math.max(args[0].rows, args[0].cols), "double")),
    "size" : new MatlabFunction(1, (args: Matrix[]) => new Matrix(1, 2, [args[0].rows, args[0].cols], "double")),

    "sum" : new MatlabFunction([1,2], (args: Matrix[]) => matrixAccumulation(args[0], args[1], (a:number, b:number) => a + b)),
    "prod" : new MatlabFunction([1,2], (args: Matrix[]) => matrixAccumulation(args[0], args[1], (a:number, b:number) => a * b)),
    "min" : new MatlabFunction([1,2], (args: Matrix[]) => matrixAccumulation(args[0], args[1], (a:number, b:number) => Math.min(a, b))),
    "max" : new MatlabFunction([1,2], (args: Matrix[]) => matrixAccumulation(args[0], args[1], (a:number, b:number) => Math.max(a, b))),

    "sqrt" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.sqrt(val))),
    "sin" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.sin(val))),
    "cos" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.cos(val))),
    "tan" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.tan(val))),
    "asin" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.asin(val))),
    "acos" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.acos(val))),
    "atan" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.atan(val))),
    // "atan2" : new MatlabFunction(2, (args: Matrix[]) => matrixBinaryFunction(args[0], args[1], (val1:number, val2: number) => Math.atan2(val1, val2))),
    "sinh" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.sinh(val))),
    "cosh" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.cosh(val))),
    "tanh" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.tanh(val))),
    "asinh" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.asinh(val))),
    "acosh" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.acosh(val))),
    "atanh" : new MatlabFunction(1, (args: Matrix[]) => matrixUnaryFunction(args[0], (val:number) => Math.atanh(val))),

    "display": new MatlabFunction([1,MatlabFunction.ARGS_INF], unsupportedMatlabFunction("display")),

    "imshow": new MatlabFunction(1, (args: Matrix[], construct: CodeConstruct) => {
        // construct.environment.showImage()
        return new Matrix(1, 1, [1], "double")
    })
}

export interface EnvironmentListener {
    onVariableSet(vari: Variable): void;
}

export class Environment {

    public static readonly global : Environment;

    public static setGlobalEnvironment(elem: JQuery) {
        let global = new Environment(elem);

        asMutable(Environment).global = global;
    }

    private readonly elem? : JQuery;
    private readonly vars : {[index:string] : Variable | undefined } = {};
    private readonly functions : {[index:string] : MatlabFunction | undefined } = {};
    private readonly endValueStack : number[] = [];

    private readonly listeners: EnvironmentListener[] = [];

    public constructor (elem?: JQuery) {
        this.elem = elem;

        // Add built in functions to environment
        for(let functionName in MATLAB_FUNCTIONS) {
            this.setFunction(functionName, MATLAB_FUNCTIONS[functionName]);
        }
    }

    public hasVar(name : string) {
        return this.vars.hasOwnProperty(name);
    }

    public lookup(name: string) : Variable | MatlabFunction | undefined {
        let vari = this.vars[name];
        if (vari) {
            // If a variable with that name exists, it is found first,
            // even if there is also a function with that same name
            return vari;
        }

        return this.functions[name]; // or undefined if no functions with that name either
    }

    public varLookup(name: string) : Variable | undefined {
        return this.vars[name];
    }

    public functionLookup(name: string) : MatlabFunction | undefined {
        return this.functions[name];
    }

    public setVar(name: string, value: Matrix) {
        let vari = this.vars[name];
        if (vari) {
            vari.setValue(value);
        }
        else{
            vari = new Variable(name, value);
            if (this.elem) {
                if (name !== "ans"){
                    this.elem.append(vari.elem);
                }
                else{
                    this.elem.prepend(vari.elem);
                }
            }
            this.vars[name] = vari;
        }

        this.listeners.forEach(l => l.onVariableSet(vari!));
    }

    public setFunction(name: string, func: MatlabFunction) {
        this.functions[name] = func;
    }

    public pushEndValue(value: number) {
        this.endValueStack.push(value);
    }

    public popEndValue() {
        this.endValueStack.pop();
    }

    public getEndValue() : number | undefined {
        return this.endValueStack[this.endValueStack.length - 1];
    }

    public addListener(listener: EnvironmentListener) {
        this.listeners.push(listener);
    }
}

export type ASTNode = any;

export abstract class CodeConstruct implements Visualizable {


    // TODO: move somewhere appropriate
    public static createRedX() {
        return $('<svg class="matlab-error-svg"><line x1="-20" y1="80%" x2="100%" y2="20%" style="stroke:rgba(255,0,0, 0.3);stroke-width:5" transform="translate(10,0)"></line><line style="stroke:rgba(255,0,0, 0.3);stroke-width:5" y2="80%" x2="100%" y1="20%" x1="-20" transform="translate(10,0)"></line></svg>');
    }

    public static create(ast: ASTNode, env: Environment) {
        if (ast["what"] === "statement_group") {
            return new StatementGroup(ast, env);
        }
        if (ast["what"] === "assignment") {
            return new Assignment(ast, env);
        }
        else if (ast["what"] === "indexed_assignment") {
            return new IndexedAssignment(ast, env);
        }
        else {
            return Expression.create(ast, env);
        }
    }

    protected readonly ast: ASTNode;
    public readonly env: Environment;

    protected constructor(ast: ASTNode, env: Environment) {
        this.ast = ast;
        this.env = env;
    }

    public abstract execute(): ExecutedExpressionResult;
    public abstract visualize_html(options?: VisualizationOptions): string;

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

    public static create(ast: ASTNode, env: Environment) {
        // console.log(ast["what"]);
        return this.grammarToSubclass[ast["what"]](ast, env);
    }

    // Map from "what" key in src generated by grammar to
    // the name of the subclass in the code.
    // TODO: Revise to use factory pattern or abstract factory pattern?
    private static grammarToSubclass : {[index: string]: (a: ASTNode, env: Environment) => Expression} = {
        "matrix_exp": (a: ASTNode, env: Environment) => new MatrixExpression(a, env),
        "row_exp": (a: ASTNode, env: Environment) => new RowExpression(a, env),
        "range_exp": (a: ASTNode, env: Environment) => new RangeExpression(a, env),
        "or_exp": (a: ASTNode, env: Environment) => new MatrixOrExpression(a, env),
        "and_exp": (a: ASTNode, env: Environment) => new MatrixAndExpression(a, env),
        "eq_exp": (a: ASTNode, env: Environment) => new EqualityExpression(a, env),
        "rel_exp": (a: ASTNode, env: Environment) => new RelationalExpression(a, env),
        "add_exp": (a: ASTNode, env: Environment) => new AddExpression(a, env),
        "mult_exp": (a: ASTNode, env: Environment) => new MultExpression(a, env),
        "unary_exp": (a: ASTNode, env: Environment) => new UnaryOperatorExpression(a, env),
        "transpose_exp": (a: ASTNode, env: Environment) => new TransposeExpression(a, env),
        "call_exp": (a: ASTNode, env: Environment) => new IndexOrCallExpression(a, env),
        "colon_exp": (a: ASTNode, env: Environment) => new ColonExpression(a, env),
        "end_exp": (a: ASTNode, env: Environment) => new EndExpression(a, env),
        "integer": (a: ASTNode, env: Environment) => new LiteralExpression(a, env),
        "float": (a: ASTNode, env: Environment) => new LiteralExpression(a, env),
        "identifier": (a: ASTNode, env: Environment) => new IdentifierExpression(a, env)
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

    public execute() : ExecutedExpressionResult {
        let res = this.evaluate();
        this.setResult(res);
        return res;
    }

    protected abstract evaluate() : ExecutedExpressionResult;

    public visualize_html(options?: VisualizationOptions) : string {
        let elem = $("<div></div>");
        let expr = $(`<div class="matlab-exp">${this.visualize_expr(options)}</div>`).appendTo(elem);
        
        if (this.result.kind === "error" && this.result.error.construct === this) {
            expr.append(CodeConstruct.createRedX());

            let bottom = $(`
            <div class="matlab-exp-bottom">
                <div class="matlab-exp-error">
                    ${this.result.error.message}
                </div>
            </div>`);
            elem.append(bottom);
        }

        return elem[0].outerHTML;
    }

    protected abstract visualize_expr(options?: VisualizationOptions): string;

}

// TODO: lhs should not use IdentifierExpression? should just be name, I think
export class Assignment extends CodeConstruct {
    
    public readonly rhs: Expression;
    public readonly lhs: IdentifierExpression;

    public readonly updatedValue?: Matrix;

    constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.lhs = <IdentifierExpression>Expression.create(ast["identifier"], env)
        this.rhs = Expression.create(ast["exp"], env);
    }

    public execute() {

        let rhsResult = this.rhs.execute();

        if (rhsResult.kind !== "success") {
            return rhsResult;
        }

        let env = this.env;
        let name = this.lhs.name;

        env.setVar(name, rhsResult.value);
        (<Mutable<this>>this).updatedValue = rhsResult.value;

        return rhsResult;
    }

    public visualize_html() {
        let elem = $("<div></div>");
        let top = 
        `<div class="matlab-assignment">
            ${this.lhs.name}
            &nbsp;=&nbsp;
            ${this.rhs.visualize_html()}
        </div>`;
        elem.append(top);

        if (this.updatedValue) {
            let bottom = `<div class="matlab-assignment-result">
                ${this.lhs.name} is now ${this.updatedValue.visualize_html()}
            </div>`;
            elem.append(bottom);
        }

        return elem[0].outerHTML;
    }
}

// TODO: reduce code duplication between IndexedAssignment and IndexOrCallExpression
class IndexedAssignment extends Expression {
    
    public readonly targetName: string;
    public readonly indicies: readonly Expression[];
    public readonly rhs: Expression;
    
    public readonly subarrayResult?: Subarray;
    public readonly originalMatrix?: Matrix;
    public readonly updatedMatrix?: Matrix;

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        // TODO: may be nice to change grammar here to not have a nested identifier
        this.targetName = ast["lhs"]["target"];
        this.indicies = ast["lhs"]["args"].map((i:ASTNode) => Expression.create(i, env));
        this.rhs = Expression.create(ast["rhs"], env);
    }

    // TODO: change to execute
    public evaluate() : ExecutedExpressionResult {
        let vari = this.env.lookup(this.targetName);
        if (!vari || vari instanceof MatlabFunction) {
            return errorResult(new MatlabError(this, "Sorry, I can't find a variable named " + this.targetName));
        }

        let target = vari.value;
        (<Mutable<this>>this).originalMatrix = target.clone();

        if (this.indicies.length > 2) {
            return errorResult(new MatlabError(this, "Sorry, indexing in more that two dimensions is not currently supported."));
        }

        let rhsResult = this.rhs.execute();

        if (rhsResult.kind !== "success") {
            return rhsResult;
        }

        let indicesResults = this.indicies.map((index, i) => {
            this.env.pushEndValue(target.length(<1|2>(i+1)));
            let res = index.execute();
            this.env.popEndValue();
            return res;
        });
        
        if (!allSuccess(indicesResults)) {
            return indicesResults.find(r => {return r.kind !== "success";})!;
        }

        if (indicesResults.length === 1) {
            (<Mutable<this>>this).subarrayResult = LinearSubarray.create(
                this.indicies[0] instanceof ColonExpression ? ":" : indicesResults[0].value);
        }
        else {
            (<Mutable<this>>this).subarrayResult = CoordinateSubarray.create(
                this.indicies[0] instanceof ColonExpression ? ":" : indicesResults[0].value,
                this.indicies[1] instanceof ColonExpression ? ":" : indicesResults[1].value);
        }

        try {
            this.subarrayResult!.verify(vari.value);
            this.subarrayResult!.assign(vari.value, rhsResult.value);
            vari.refresh();
            (<Mutable<this>>this).updatedMatrix = vari.value.clone();
            return successResult(this.updatedMatrix!);
        }
        catch(msg) {
            return errorResult(new MatlabError(this, msg));
        }

    }

    protected visualize_expr(options?: VisualizationOptions) {

        let valueHtml;
        
        if (this.originalMatrix && this.subarrayResult) {
            valueHtml = this.subarrayResult.visualize_selection(this.originalMatrix);
            
        }
        else {
            //TODO
            valueHtml = "";
        }
        
        let top = `<div class="matlab-assignment">
            <div>
                <div class="matlab-exp-index">
                    ${valueHtml}
                    <div class="matlab-identifier-name">
                        ${this.targetName}
                    </div>
                </div>
                
            </div>
            &nbsp;=&nbsp;
            ${this.rhs.visualize_html()}
        </div>`;
        
        let bottom = this.updatedMatrix ? `
            <div class="matlab-assignment-result">
                ${this.targetName} is now ${this.updatedMatrix.visualize_html()}
            </div>`
            : "";

        return `<div>
            ${top}
            ${bottom}
        </div>`;
    }
}

export type Statement = Assignment | IndexedAssignment | Expression;

export class StatementGroup extends CodeConstruct {
    
    public readonly statements: readonly Statement[];

    public readonly updatedValue?: Matrix;

    private lastStatementExecuted?: Statement;

    constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.statements = ast.statements.map((sAst: ASTNode) => CodeConstruct.create(sAst, env));
        assert(this.statements.length > 0);
    }

    public execute() {

        let result: ExecutedExpressionResult;
        for(let i = 0; i < this.statements.length; ++i) {
            let statement = this.statements[i];
            this.lastStatementExecuted = statement;
            result = statement.execute();
            if (result.kind !== "success") {
                return result;
            }
        }

        return result!; // ! because statements length cannot be 0 (see ctor)
    }

    public visualize_html() {
        return this.lastStatementExecuted!.visualize_html();
    }
}

class MatrixExpression extends Expression {

    public readonly rows: readonly Expression[];

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.rows = ast["rows"].map((r:any) => Expression.create(r, env));
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

    public visualize_expr() {
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
            td.html(rows[i].visualize_html({contained: true}));
        }
        return table[0].outerHTML;
    }
}

class RowExpression extends Expression {
    
    public readonly cols: readonly Expression[];

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.cols = ast["cols"].map((r:any) => Expression.create(r, env));
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

    public visualize_expr() {
        var cols = this.cols;
        if (cols.length == 1) {
            // Single element row - just visualize the element, not as a row
            return cols[0].visualize_html();
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
                td.html(cols[i].visualize_html({contained: true}));
            }
            return table[0].outerHTML;
        }
    }
}

class RangeExpression extends Expression {

    public readonly start: Expression;
    public readonly end: Expression;
    public readonly step: Expression | null;

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.start = Expression.create(ast.start, env);
        this.end = Expression.create(ast.end, env);
        this.step = ast.step ? Expression.create(ast.step, env) : null;
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

    public visualize_expr() {

        let resultHtml = undefined;
        if (this.result.kind === "success") {
            let value = this.result.value;

            let rowHtml = "";
            for (var i = 1; i <= value.numel; ++i) {
                rowHtml +=
                `<td>
                    ${scalarHtml(value.atLinear(i))}
                </td>`
            }

            resultHtml = `
            <div class="matlab-range-result">
                <table class="matlab-table" style="background-color: ${Color.toColor(value, Color.LIGHT_LETTERS)}">
                    <svg class="matlab-range-svg">
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refx="9" refy="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                            </marker>
                        </defs>
                        <g transform="translate(-10,0)">
                            <line x1="22" y1="25" x2="100%" y2="25" stroke="#000" stroke-width="1" marker-end="url(#arrow)" />
                        </g>
                    </svg>
                    <tr>${rowHtml}</tr>
                </table>
            </div>`
        }

        return `<div class="matlab-range">
            <div class="matlab-range-header">
                <table class="matlab-table">
                    <tr>
                        <th>start</th>
                        ${this.step ? "<th>step</th>" : ""}
                        <th>end</th>
                    </tr>
                    <tr>
                        <td>${this.start.visualize_html()}</td>
                        ${this.step ? "<td>" + this.step.visualize_html() + "</td>" : ""}
                        <td>${this.end.visualize_html()}</td>
                    </tr>
                </table>
            </div>
            ${resultHtml}
        </div>`;

    }
}

abstract class BinaryOperatorExpression extends Expression {

    public readonly left: Expression;
    public readonly right: Expression;
    public readonly op: string;

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.op = ast.op;

        this.left = Expression.create(ast.left, env);
        this.right = Expression.create(ast.right, env);
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


    public visualize_expr() {
        return `<div class="matlab-exp-binaryOp">
            <div>${this.left.visualize_html()}</div>
            <div>&nbsp;${this.op}&nbsp;</div>
            <div>${this.right.visualize_html()}</div>
        </div>`;
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

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.op = ast.op;

        this.operand = Expression.create(ast.sub, env);
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

    public visualize_expr() {
        return `<div class="matlab-exp-unaryOp">
            <div>${this.op}&nbsp;</div>
            <div>${this.operand.visualize_html()}</div>
        </div>`;
    }
}
export class TransposeExpression extends Expression {

    public readonly operand: Expression;
    public readonly numTransposes: number;

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.numTransposes = ast.transposes.length;

        this.operand = Expression.create(ast.sub, env);
    }

    protected evaluate() {

        let operandResult = this.operand.execute();

        if (operandResult.kind !== "success") {
            return operandResult;
        }
        // [1,2,3;4,5,6;7,8,9]     1 4 7 2 6 8 3 6 9
        // Perform transpose by doing a row-major traversal and recording as new column-major data
        let oldMat = operandResult.value;
        let newData : number[] = [];
        for(let r = 1; r <= oldMat.rows; ++r) {
            for (let c = 1; c <= oldMat.cols; ++c) {
                newData.push(oldMat.at(r, c));
            }
        }

        // Result matrix has number of cols/rows switched and new data from above
        return successResult(new Matrix(oldMat.cols, oldMat.rows, newData, oldMat.dataType));
    }

    public visualize_expr() {
        return `<div class="matlab-exp-unaryOp">
            <div>transpose&nbsp;</div>
            <div>${this.operand.visualize_html()}</div>
        </div>`;
    }
}


// TODO: This whole thing needs a bit of review
class IndexOrCallExpression extends Expression {

    // currentIndexedVariable : null
    // currentIndexedDimension : 0,
    
    public readonly targetName: string;
    public readonly indiciesOrArgs: readonly Expression[];

    public readonly subarrayResult?: Subarray;
    public readonly originalMatrix? : Matrix;

    public readonly executedFunction? : MatlabFunction;

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.targetName = ast["target"];
        this.indiciesOrArgs = ast["args"].map((i:ASTNode) => Expression.create(i, env));
    }

    protected evaluate() {
        let vari = this.env.lookup(this.targetName);
        if (!vari) {
            return errorResult(new MatlabError(this, "Sorry, I can't find a variable or function named " + this.targetName));
        }

        if (vari instanceof Variable) {
            let target = vari.value;
            (<Mutable<this>>this).originalMatrix = target.clone();

            if (this.indiciesOrArgs.length > 2) {
                // TODO: add an error message that suggests students might have shadowed a function, if that is the case. maybe add it here?
                return errorResult(new MatlabError(this, "Sorry, indexing in more that two dimensions is not currently supported."));
            }

            let indicesResults = this.indiciesOrArgs.map((index, i) => {
                this.env.pushEndValue(target.length(<1|2>(i+1))); // 1 or 2 guaranteed from above error check for too many indices
                let res = index.execute();
                this.env.popEndValue();
                return res;
            });

            
            if (!allSuccess(indicesResults)) {
                return indicesResults.find(r => {return r.kind !== "success";})!;
            }

            if (indicesResults.length === 1) {
                (<Mutable<this>>this).subarrayResult = LinearSubarray.create(
                    this.indiciesOrArgs[0] instanceof ColonExpression ? ":" : indicesResults[0].value);
            }
            else {
                (<Mutable<this>>this).subarrayResult = CoordinateSubarray.create(
                    this.indiciesOrArgs[0] instanceof ColonExpression ? ":" : indicesResults[0].value,
                    this.indiciesOrArgs[1] instanceof ColonExpression ? ":" : indicesResults[1].value);
            }

            try {
                this.subarrayResult!.verify(target);
                return successResult(this.subarrayResult!.readValue(target));
            }
            catch(msg) {
                return errorResult(new MatlabError(this, msg));
            }
        }
        else {
            let func = (<Mutable<this>>this).executedFunction = vari;
            if (!func.isValidNumberOfArgs(this.indiciesOrArgs.length)) {
                return errorResult(new MatlabError(this, `Invalid number of arguments for the ${this.targetName} function.`));
            }

            let argResults = this.indiciesOrArgs.map((input) => input.execute());

            if (!allSuccess(argResults)) {
                return argResults.find(r => {return r.kind !== "success";})!;
            }

            return func.operate(this, argResults.map((argRes) => argRes.value));
        }

        

    }

    protected visualize_expr(options?: VisualizationOptions) {
        
        let wrapper = $("<div></div>");
        wrapper.addClass("matlab-exp-index");


        let valueHtml;
        
        if (this.originalMatrix && this.subarrayResult) {
            valueHtml = this.subarrayResult.visualize_selection(this.originalMatrix);
            return `<div class="matlab-exp-index">
                ${valueHtml}
                <div class="matlab-identifier-name">${this.targetName}</div>
            </div>`
            
        }
        else if (this.executedFunction) {
            return `<div class="matlab-exp-call">
                ${this.targetName}(
                    ${this.indiciesOrArgs.map((arg) => `<div class="matlab-call-arg">${arg.visualize_html()}</div>`).join(",")}
                )</div>`
        }
        else {
            //TODO
            return "";
        }

    }
}

class ColonExpression extends Expression {

    public evaluate() {
        return successResult(new Matrix(1,1,[1],"double")); // dummy value
    }

    protected visualize_expr() {
        return "<span>:</span>";
    }
}

function scalarHtml(value: number) {
    var numStr = Matrix.formatNumber(value);
    return `<div class="matlab-scalar${numStr.length > 3 ? " double" : ""}">
        <span>${numStr}</span>
    </div>`;
}

export class LiteralExpression extends Expression {

    private readonly literalValue : Matrix;
    
    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.literalValue = Matrix.scalar(this.ast["value"], "double");
    }

    protected evaluate() {
        return successResult(this.literalValue);
    }

    public visualize_expr(options?: VisualizationOptions) {

        if (options && options.contained) {
            return scalarHtml(this.literalValue.scalarValue())
        }
        else {
            return this.literalValue.visualize_html();
        }
    }
}

// TODO: reserved words can't be used as identifiers
export class IdentifierExpression extends Expression {

    public readonly name: string;

    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
        this.name = ast["identifier"];
    }

    protected evaluate() {
        let env = this.env;
        let vari = env.lookup(this.name);
        if (vari && !(vari instanceof MatlabFunction)) {
            return successResult(vari.value);
        }
        else {
            return errorResult(new MatlabError(this, "Cannot find variable " + this.name));
        }
    }

    public visualize_expr() {
        return `<div class="matlab-identifier">
            ${this.result.kind === "success" ? this.result.value.visualize_html() : ""}
            <div class="matlab-identifier-name">${this.name}</div>
        </div>`;
    }
}

export class EndExpression extends Expression {
    
    public constructor(ast: ASTNode, env: Environment) {
        super(ast, env);
    }

    protected evaluate() {
        let endValue = this.env.getEndValue();
        if (endValue) {
            return successResult(Matrix.scalar(endValue, "double"));
        }
        else {
            return errorResult(new MatlabError(this, "The end keyword is only allowed within the context of an indexing expression."));
        }
    }

    public visualize_expr() {
        return `<div class="matlab-identifier">
            ${this.result.kind === "success" ? this.result.value.visualize_html() : ""}
            <div class="matlab-identifier-name">end</div>
        </div>`;
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
