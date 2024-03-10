/**
 * @fileoverview Define any tools here as classes.
 */


const spawn = require('child_process').spawn;


/**
 * An example tool that fires up the Python Ecosystem from NodeJS.
 */
class PythonBasedTool {
  constructor() {
    this.result = "";
    this.toolDir= __dirname+"/pyScripts/PythonBasedTool/";
    /**
     * Path for python interpreter in the virtual environment (python3.9)
     * @type {string}
     */
    this._pyInterpreter = "<PATH-TO-WORKSPACE>/<NAME-OF-VIRTUALENV>/bin/python";
  }
  
  async runScript(/*callback_SendMessage, */res, param1="", param2="") {
    const context =  this;
    const pythonProcess = spawn(context._pyInterpreter, [this.toolDir + 'main.py', "-a", param1, 
                                                                                    "-b", param2,
                                                                                  ]);

    pythonProcess.stdout.on('data', function (data) {
      context.result += data.toString();
     });

    pythonProcess.on('close', function(code) {
      res.json({
        title: "result",
        result: context.result,
        message: "Process successful.",
        logs: "<logs-here>"
      })
    });

    pythonProcess.stderr.on('data',(data)=>{
      console.log(`stderr : ${data}`);
      res.json({
        title: "result",
        result: false,
        message: "There has been an error.",
        logs: data,
      })
    })

  }
}

module.exports = { PythonBasedTool };