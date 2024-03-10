/**
 * @fileoverview Define any system functions/services here as classes.
 */


/**
 * An example function, allowing polymorphic usage if modified accordingly.
 */
class FunctionExample {
  constructor() {
    this.variable = "VARIABLES-HERE";
  }
  
  // Method
  async runScript(res) {
    // TODO: Perform the async function here, await for result.
    // await performMyFunction();
    res.json({message: "Success.", result: "<RESULT_OBJ_HERE>"});
  }
}

module.exports = { FunctionExample };