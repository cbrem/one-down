function assert(expr, errorMsg){
    if (!expr){
        if(errorMsg === undefined){
            errorMsg = "assertion error message not given";
        }
        
        throw("Assertion Error:", errorMsg);
    }
}