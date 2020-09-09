import {getQueryString} from "./util/util";
import {SyntaxError, parse as matlab_parse} from "./matlab_parser"
import { CodeConstruct, Environment, MatlabError } from "./matlab";


// import {gapi} from "https://apis.google.com/js/platform.js";




$(document).ready(function(){

    let globalWorkspace = new Environment($("#vars"), $("canvas"));
    
    
    var queryString = getQueryString();

    if (queryString["size"]){
        $("body").css("font-size", queryString["size"]+"pt");
    }

    if (queryString["pre"]){
        var statements = JSON.parse(queryString["pre"]);
        for (var i = 0; i < statements.length; ++i){
            var srcText = matlab_parse(statements[i]);
            var cc = CodeConstruct.create(srcText, globalWorkspace);
            cc.execute();
        }
    }

    var vis = $("#visualization");

    var parseAndEval = function(text: string) {
        if (text.length > 0) {
            try {
                var src = matlab_parse(text);
                var cc = CodeConstruct.create(src, globalWorkspace);
                var result = cc.execute();
                vis.html(cc.visualize_html());
                //var result = cc.evaluate();
                // processAns(result);
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
    };

    if (queryString["exp"]) {
        var exp = JSON.parse(queryString["exp"]);
        $("#expression_in").html(exp);
        parseAndEval(exp);
    }


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