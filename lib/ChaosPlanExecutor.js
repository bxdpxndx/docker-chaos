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

var ScenarioExecutor = require('./ScenarioExecutor');

function ChaosPlanExecutors (composeFile, chaosPlan, scenarioExecutor) {
    this.composeFile = composeFile;
    this.chaosPlan = chaosPlan;
    this.scenarioId = 0;

    this.scenarioExecutor = scenarioExecutor || new ScenarioExecutor();
}


ChaosPlanExecutors.prototype.runNextScenario = function(callback) {
    var scenarios = this.chaosPlan.getScenarios();

    if (this.scenarioId >= scenarios.length) {
        this.scenarioId = 0;
    }
    var scenario = scenarios[this.scenarioId];
    console.log("Starting scenario %s", scenario);
    this.scenarioExecutor.exec(this.composeFile, scenario, callback);
    this.scenarioId ++;
};

module.exports = ChaosPlanExecutors;
