import { Matrix, Environment, CodeConstruct, EnvironmentListener, Variable } from "./matlab";
import { Mutable, getQueryString, assert } from "./util/util";
import {SyntaxError, parse as matlab_parse, parse} from "./matlab_parser"

class VariableExercise {

    public readonly variableName: string;
    public readonly targetValue: Matrix;
    // public readonly isComplete: boolean = false;

    public constructor(variableName: string, target: Matrix) {
        this.variableName = variableName;
        this.targetValue = target;
    }

    public check(env: Environment) {
        let v = env.varLookup(this.variableName);
        return v && v.value.equals(this.targetValue);
    }

    // public attempt(value: Matrix) {
    //     if (value.equals(this.targetValue)) {
    //         (<Mutable<this>>this).isComplete = true;
    //     }
    // }

    public visualize_html(env: Environment) {
        let isComplete = this.check(env);
        let completeMessage = '<span class="glyphicon glyphicon-ok matcrab-complete-glyphicon"></span>';
        let incompleteMessage = '<span class="glyphicon glyphicon-option-horizontal matcrab-incomplete-glyphicon"></span>';

        return `
            <div style="position: relative">
                <span class="badge matlab-var-badge">${this.variableName}</span>
                <div class="matcrab-visualization">${this.targetValue.visualize_html()}</div>
                <div class="matcrab-variable-exercise-status">${isComplete ? completeMessage : incompleteMessage}</div>
            </div>
        `;
    }
}

class ExerciseGroup implements EnvironmentListener {

    public readonly env: Environment;

    public readonly exercises : readonly VariableExercise[];

    public readonly description?: string;
    public readonly solutionMessage?: string;

    private elem: JQuery;

    public constructor(elem: JQuery, env: Environment, targets: {[index:string]: Matrix}, description?: string, solutionMessage?: string) {
        this.elem = elem;
        this.env = env;
        this.exercises = Object.keys(targets).map((v) => new VariableExercise(v, targets[v]));
        this.description = description;
        this.solutionMessage = solutionMessage;

        env.addListener(this);
        this.elem.html(this.visualize_html())
    }

    public onVariableSet(vari: Variable) {
        this.exercises.forEach(ex => {
            if (ex.variableName === vari.name) {
                this.elem.html(this.visualize_html());
            }
        });
    }
    
    public check() {
        return this.exercises.every(e => e.check(this.env));
    }

    private visualize_html() {
        return `
        ${this.description ? `<div style="text-align:center">${this.description}</div>` : ""}
        <table>
            <tr>
                ${this.exercises.reduce((prev, ex) => prev + `<td>${ex.visualize_html(this.env)}</td>`, "")}
            </tr>
        </table>
        ${(this.solutionMessage && this.check()) ? `<div class="alert alert-success" style="text-align:center">${this.solutionMessage}</div>` : ""}`;
    }

}

function parseExecuteVisualize(text: string, env: Environment, vis: JQuery) {
    try {
        if (text.length > 0) {
            var src = matlab_parse(text);
            var cc = CodeConstruct.create(src, env);
            var result = cc.execute();
            vis.html(cc.visualize_html());
        }
    }
    catch(err) {
        if (err.name === "SyntaxError") {
            vis.html("Syntax Error");
        }
        else {
            vis.html("Sorry, an unexpected MatCrab error occurred. Please report to jjuett@umich.edu.")
            throw err;
        }
    }
}

function bindEntryToVisualization(entry: JQuery, vis: JQuery, globalWorkspace: Environment) {
    let exp_in_timeout: number;

    entry.keypress(function (e) {
        var code = e.keyCode || e.which;

        // Do nothing unless it's an <Enter> with keycode 13
        // (and not a shift enter)
        if (code != 13 || e.shiftKey) { return; }

        e.preventDefault();

        var delay = 500; // ms
        clearTimeout(exp_in_timeout);
        exp_in_timeout = setTimeout(() => {
            if (entry.val() === undefined) { return; }
            var text = (<string>entry.val()).trim();
            vis.empty();
            parseExecuteVisualize(text, globalWorkspace, vis);
        }, delay);
        return false;
    });
}

function bindRunButtonToVisualization(runButton: JQuery, entry: JQuery, vis: JQuery, globalWorkspace: Environment) {
    let exp_in_timeout: number;

    runButton.click(function (e) {
        e.preventDefault();

        var delay = 500; // ms
        clearTimeout(exp_in_timeout);
        exp_in_timeout = setTimeout(() => {
            if (entry.val() === undefined) { return; }
            var text = (<string>entry.val()).trim();
            vis.empty();
            parseExecuteVisualize(text, globalWorkspace, vis);
        }, delay);
        return false;
    });
}

function trimWhitespace(src: string) {
    return src.trim().split("\n").map(line => line.trim()).join("\n")
} 

function renderExercises() {

    $(".matcrab-variable-target-exercise").filter(function() {
        return !$(this).data("rendered");
    }).each(function() {
        
        let targets : {[index:string]: Matrix} = {};

        // Add each target to execise
        $(this).find(".matcrab-variable-target").each(function() {
            let t = $(this);
            let src = trimWhitespace(t.html());
            let ast = matlab_parse(src);
            let tempWorkspace = new Environment();
            let cc = CodeConstruct.create(ast, tempWorkspace);
            let result = cc.execute();
            assert(result.kind === "success");
            targets[t.data("name")] = result.value;
        }).remove();

        let questionMsg = $(this).find(".matcrab-exercise-question").html() ?? "";
        questionMsg = questionMsg.trim();
        $(this).find(".matcrab-exercise-question").remove();

        
        let completeMsg = $(this).find(".matcrab-exercise-complete").html() ?? "";
        completeMsg = completeMsg.trim();
        $(this).find(".matcrab-exercise-complete").remove();
        
        let exerciseWorkspace = new Environment($(this).find(".matcrab-workspace"));
        
        // Handle any initial setup code (e.g. to populate workspace vars)
        let setupSrc = trimWhitespace($(this).find(".matcrab-setup").html() || "");
        let setupAst = matlab_parse(setupSrc);
        if (!setupAst.statements || setupAst.statements.length > 0) {
            CodeConstruct.create(setupAst, exerciseWorkspace).execute();
        }
        $(this).find(".matcrab-setup").remove();

        new ExerciseGroup(
            $(this).find(".matcrab-exercise-status"),
            exerciseWorkspace,
            targets,
            questionMsg,
            completeMsg
        );

        let reset = $(this).find(".matcrab-reset");
        let run = $(this).find(".matcrab-run");
        let entry = $(this).find(".matcrab-entry");
        let vis = $(this).find(".matcrab-vis");

        bindEntryToVisualization(entry, vis, exerciseWorkspace);
        bindRunButtonToVisualization(run, entry, vis, exerciseWorkspace);
        
        // Set up reset button
        reset.on("click", (e) => {

            // Clear envrionment and re-execute setup
            exerciseWorkspace.clear()
            if (!setupAst.statements || setupAst.statements.length > 0) {
                CodeConstruct.create(setupAst, exerciseWorkspace).execute();
            }

        })

    }).data("rendered", true);

    // let backgroundWorkspace = new Environment();

    $(".matcrab-vis-exp").filter(function() {
        return !$(this).data("rendered");
    }).each(function() {
        let src = $(this).html();
        // Trim leading whitespace on each line of initial value
        // of entry. This is helpful since there's indentation whitespace
        // in the html.
        src = trimWhitespace(src);
        console.log(src);

        let ast = matlab_parse(src);
        let tempWorkspace = new Environment();
        let cc = CodeConstruct.create(ast, tempWorkspace);
        cc.execute();
        $(this).html(cc.visualize_html());
    }).data("rendered", true);

    $(".matcrab-example").filter(function() {
        return !$(this).data("rendered");
    }).each(function() {
        let reset = $(this).find(".matcrab-reset");
        let run = $(this).find(".matcrab-run");
        let entry = $(this).find(".matcrab-entry");
        let vis = $(this).find(".matcrab-vis");

        let exampleWorkspace = new Environment($(this).find(".matcrab-workspace"));
        
        // Handle any initial setup code (e.g. to populate workspace vars)
        let setupSrc = trimWhitespace($(this).find(".matcrab-setup").html() || "");
        let setupAst = matlab_parse(setupSrc);
        if (!setupAst.statements || setupAst.statements.length > 0) {
            CodeConstruct.create(setupAst, exampleWorkspace).execute();
        }
        $(this).find(".matcrab-setup").remove();

        // Trim leading whitespace on each line of initial value
        // of entry. This is helpful for textarea entries that might
        // have random whitespace from indentation in their html
        let v = entry.val();
        if (typeof v === "string") {
            entry.val(trimWhitespace(v));
        }

        let initialSrc = "";
        // Go ahead and evaluate initial value of entry
        if (entry.val() !== undefined) {
            initialSrc = (<string>entry.val()).trim();
            vis.empty();
            parseExecuteVisualize(initialSrc, exampleWorkspace, vis);
        }

        // Update every time entry changes (with <Enter>)
        bindEntryToVisualization(entry, vis, exampleWorkspace);
        bindRunButtonToVisualization(run, entry, vis, exampleWorkspace);

        // Set up reset button
        reset.on("click", (e) => {

            // Clear envrionment
            $(this).find(".matcrab-workspace").empty();
            exampleWorkspace = new Environment($(this).find(".matcrab-workspace"));
            if (!setupAst.statements || setupAst.statements.length > 0) {
                CodeConstruct.create(setupAst, exampleWorkspace).execute();
            }
            
            // Set entry value back to initial
            entry.val(initialSrc);

            // Rerun initial stuff
            vis.empty();
            parseExecuteVisualize(initialSrc, exampleWorkspace, vis);
        })
    }).data("rendered", true);
}

$(document).ready(renderExercises);

// Try to catch any exercises that get loaded into DOM a bit late
setTimeout(renderExercises, 1000);
setTimeout(renderExercises, 2000);
setTimeout(renderExercises, 5000);
setTimeout(renderExercises, 10000);

