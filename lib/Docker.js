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

function Docker (exec) {
    this.exec = exec || require("child_process").exec;
}

Docker.prototype.modify = function(composeFile, modifications, project_name, callback) {
    var containers = "";
    var name, amount;
    modifications.forEach(function (value) {
        name = Object.keys(value)[0];
        amount = value[name];
        containers += name + "=" + amount + " ";
    });

    var command = "docker-compose --file " + composeFile + " --project-name " + project_name + " scale " + containers;
    this.exec(command, function(code, stdout, stderr) {
        if (code !== null) {
            callback(code, stdout, stderr);
            return;
        }

        callback(null);
    });
};

module.exports = Docker;
