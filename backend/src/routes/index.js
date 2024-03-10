const express = require('express');
const router = express.Router();

// Get a list of all available backend tools and functions
const tools = require("../logic/tools");
const functions = require("../logic/functions");

// Backend subdirectory path
const routePrefix = "/platform/backend";

// eslint-disable-next-line no-unused-vars
router.get(routePrefix+'/', (req, res, next) => {
  res.send({ message: 'Welcome to the backend!' });
});


/**************  TOOL-RELATED ENDPOINTS ****************/

router.get(routePrefix+'/tools/:toolName', async (req, res, next) => {
	if (req.params.toolName in tools) {
		let toolName = req.params.toolName;
		var toolInstance = new tools[toolName]();

		await toolInstance.runScript(	res, 
										req.query.param1, 
										req.query.param2	);
	}
	else{
 		res.send({ message: 'This tool does not exist.', toolName: req.params.toolName });
	}
});

/**************  /TOOL-RELATED ENDPOINTS ****************/


/**************  FUNCTION-RELATED ENDPOINTS ****************/

router.post(routePrefix+'/functions/:functionName', async (req, res, next) => {
		if (req.params.functionName in functions) {
			var functionInstance = new functions[req.params.functionName];

			await functionInstance.runScript(res);
		}
		else{
			res.send({ message: 'Please provide the required parameters.' });
		}
});

/**************  /FUNCTION-RELATED ENDPOINTS ****************/


module.exports = router;
