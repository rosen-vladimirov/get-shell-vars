"use strict";

const fs = require("fs"),
	childProcess = require("child_process"),
	path = require("path"),
	_ = require("lodash");

// Correct order for Login shells is described here:
// http://hayne.net/MacDev/Notes/unixFAQ.html#shellStartup
const profileOrder = [
	".bash_profile",
	".bash_login",
	".profile",
	".bashrc"
];

const getPathToProfile = (shell) => {
	let currentProfileOrder = profileOrder.map(p => p.replace("bash", shell)) //in case the default shell is not bash
		.map(p => path.join(process.env.HOME, p));

	for(let profileName of currentProfileOrder) {
		if (fs.existsSync(profileName)) {
			return profileName;
		}
	}
};

const getEnvironmentVariables = () => {
	let profileName = getPathToProfile(process.env && process.env.SHELL && path.basename(process.env.SHELL) || "bash");

	let bashEnv = childProcess.execSync(`${process.env.SHELL || "/bin/bash"} -c "source ${profileName} && env"`).toString();

	let bashVars = {};

	bashEnv.split('\n').forEach(row => {
		// Environment variables cannot have = in their names, so we are safe with non-greedy regex.
		// Do not trim at the end as variable values may have space(s) at the end.
		let match = _.trimStart(row).match(/^(.+?)=(.*?$)/);

		if (match) {
			bashVars[match[1].trim()] = match[2];
		} else {
			console.log(row + " does not match regex");
		}
	});

	return bashVars;
};

module.exports = {
	getEnvironmentVariables: getEnvironmentVariables
}
