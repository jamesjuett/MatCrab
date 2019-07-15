import { Matrix, Environment, CodeConstruct } from "./matlab";
import { Mutable, getQueryString } from "./util/util";
import {SyntaxError, parse as matlab_parse} from "./matlab_parser"

class VariableExercise {

    public readonly variableName: string;
    public readonly targetValue: Matrix;
    // public readonly isComplete: boolean = false;

    public constructor(variableName: string, target: Matrix) {
        this.variableName = variableName;
        this.targetValue = target;
    }

    public check() {
        let v = Environment.getCurrentEnvironment().getVar(this.variableName);
        return v && v.value.equals(this.targetValue);
    }

    // public attempt(value: Matrix) {
    //     if (value.equals(this.targetValue)) {
    //         (<Mutable<this>>this).isComplete = true;
    //     }
    // }

    public visualize_html() {
        let isComplete = this.check()
        return `
            <div style="position: relative">
                <span class="badge matlab-var-badge">${this.variableName}</span>
                ${this.targetValue.visualize_html()}
                <div>${isComplete ? "complete!" : "pending"}</div>
            </div>
        `;
    }
}

class ExerciseGroup {

    public readonly exercises : readonly VariableExercise[];

    public constructor(targets: {[index:string]: Matrix}) {
        this.exercises = Object.keys(targets).map((v) => new VariableExercise(v, targets[v]));
    }

    public visualize_html() {
        return `<table>
            <tr>
                ${this.exercises.reduce((prev, ex) => prev + `<td>${ex.visualize_html()}</td>`, "")}
            </tr>
        </table>`;
    }

}

$(document).ready(function(){
    let exercises = new ExerciseGroup({
        x : new Matrix(2, 2, [1,2,3,4], "double"),
        y : new Matrix(1, 3, [2,3,4], "double")
    })
    
    Environment.setGlobalEnvironment($("#vars"));
    
    let renderExercises = () => {$("#exercise-group").html(exercises.visualize_html())};
    renderExercises();

    var vis = $("#visualization");

    var parseAndEval = function(text: string) {
        if (text.length > 0) {
            var src = matlab_parse(text);
            var cc = CodeConstruct.create(src);
            var result = cc.execute();
            vis.html(cc.visualize_html());
            //var result = cc.evaluate();
            // processAns(result);
            renderExercises();
        }
    };


    let exp_in_timeout : number;

    $("#expression_in").keypress(function (e) {
        var code = e.keyCode || e.which;
        if(code != 13) { //Enter keycode
            return;
        }

        e.preventDefault();
        var delay = 500; // ms
        clearTimeout(exp_in_timeout);
        var self = this;
        exp_in_timeout = setTimeout(function () {
            var text = (<string>$(self).val()).trim();
            var vis = $("#visualization");
            vis.empty();
            // try{
                parseAndEval(text);
            // }
            // catch(err) {
            //     if (err instanceof MatlabError) {
            //         if (err.visualize_html) {
            //             err.visualize_html(vis);
            //         }
            //         else{
            //             vis.html(err.message);
            //         }
            //     }
            //     else {
            //         throw err;
            //     }
            //     // processAns(null);
            // }
        }, delay);
        return false;
    });
});