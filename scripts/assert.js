/*15-237 Spring 2013 Hw1
Project name: 1-Down
Group:

- Connor Brem (cbrem)
- Erik Pintar (epintar)
- Leon Zhang (lwzhang)
*/

/** assert: (expression, String)

 general assertion handler to automatically stop execution on assertion failure
 
 params:
 expr           any expression (will be tested based on its truthiness)
 errorMsg       the error message to display if the assertion fails 
                (optional)
**/
function assert(expr, errorMsg){
    if (!expr){
        if(errorMsg === undefined){
            errorMsg = "assertion error message not given";
        }
        
        throw("Assertion Error: " + errorMsg);
    }
}
