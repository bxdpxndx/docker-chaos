#!/usr/bin/env node

/**
 * The MIT License (MIT)
 *
 * Copyright (c) <2015> <Àlex Fiestas afiestas@kde.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 **/

var fs = require('fs');
var nopt = require("nopt");
var ChaosPlanFactory = require('./lib/ChaosPlanFactory');
var ChaosPlanExecutor = require('./lib/ChaosPlanExecutor');
var DockerLogger = require('./lib/DockerLogger');
var Executor = require('./lib/Executor');
var clc = require('cli-color');
var Spinner = require('cli-spinner').Spinner;

var knownOpts = {
    "composeFile" : [String],
    "plan": [String],
    "logPath": [String],
    "duration": [Number],
    "projectName": [String]
};
var shortHands = {};

var options = nopt(knownOpts, shortHands, process.argv);

var dockerComposeFile, planFile, command, duration, project_name;

if (!options.duration) {
    options.duration =  30000;
}

duration = options.duration;
if (!options.composeFile) {
    options.composeFile = process.cwd() + '/docker-compose.yml';
}
try {
    dockerComposeFile = fs.realpathSync(options.composeFile);
} catch (err) {
    console.log("A docker-compose.yml file could not be found");
    process.exit(1);
}

if (!options.plan) {
    console.log("A plan file is needed so we know how to create chaos");
    process.exit(1);
}
if (!options.projectName) {
    console.log("A project name is needed so we know where to create chaos");
    process.exit(1);
}

planFile = fs.realpathSync(options.plan);
project_name = options.projectName;

//
// Command
//
command = options.argv.remain[0];
if (!command) {
    console.log("you need to pass the command to be executed");
    process.exit(1);
}

command = command.split(' ');
var prog = fs.realpathSync(command.shift());
command = command.length === 1 ? prog : prog + ' ' + command.join(' ');

//
// Log Path
//
var logPath = '/tmp/logs-' + (new Date().toISOString());
if (options.logPath) {
    logPath = options.logPath;
    if (fs.existsSync(logPath)){
        console.log("Log path " + logPath + " already exists. Aborting");
        process.exit(1);
    }
}
fs.mkdirSync(logPath);

console.log(clc.whiteBright('Test:'), clc.white(command));
console.log(clc.whiteBright('Chaos Plan:'), clc.white(planFile));
console.log(clc.whiteBright('Docker-compose:'), clc.white(dockerComposeFile));
console.log(clc.whiteBright('Logs:'), clc.white(logPath));
console.log();

var planData = fs.readFileSync(planFile);

var chaosPlanFactory = new ChaosPlanFactory();
var chaosPlan = chaosPlanFactory.getChaosPlan(planData, project_name);

var chaosPlanExecutor = new ChaosPlanExecutor(dockerComposeFile, chaosPlan);
var testExecutor = new Executor(command);

var dockerLogger = new DockerLogger(logPath);
dockerLogger.start(function() {});

function mainloop(lastStartTime, retryCount) {
    if(retryCount === void 0) {
        retryCount = 0;
    }
    console.log("Running tests... Attempt %s", retryCount + 1);
    testExecutor.runTests(function(err, result) {
        if(err) {
            console.log("Tests errored out!", result);
            return mainloop(lastStartTime, retryCount + 1);
        }
        console.log("Test run succeeded! Number of retries: %s. Time until recovery: %s seconds", retryCount, (new Date() - lastStartTime)/1000);
        return chaosPlanExecutor.runNextScenario(function(err) {
            if (err) {
                console.log("Error setting up scenario");
            }
            mainloop(new Date());
        });
    })
}

mainloop(new Date());

setTimeout(function() {
    console.log("Stopping execution");
    dockerLogger.stop();
    //process.exit();
}, duration);
