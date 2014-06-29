;(function(window, document, undefined){
    function parser(){
        console.log("PARSER!!");
    }

    var internalB = {};


    //independat code code code
    function exe(){
        //independat code code code
        parser();
        //independat code code code
    }
    //independat code code code

    internalB.execute = exe;


    window.B = internalB;



})(this, document);