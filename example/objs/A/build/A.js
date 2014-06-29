;(function(window, document, undefined){
    function ajaxGet(){
        console.log("GET!");
    }

    function ajaxPost(){
        console.log("POST!");
    }

    var a_ = {};


    //Independant code code code
    function callXApi(){
        //Independant code code code
        ajaxGet();
        //Independant code code code
        ajaxPost();
        //Independant code code code    
    }
    //Independant code code code

    a_.callX = callXApi;


    //Independant code code code
    function callYApi() {
        //Independant code code code
        ajaxGet();
        //Independant code code code
    }
    //Independant code code code

    a_.callY = callYApi;


    window.A = a_;



})(this, document);