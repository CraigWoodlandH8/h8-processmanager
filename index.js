const { spawn } = require("child_process");
const path = require('path');
const fs = require('fs');

var findLogPath = () => {
  var fullpath = path.normalize(__dirname).replace(/\\/g, "/"),
      outputPath = null,
      parts = fullpath.split('/');

  while(parts.length > 0 && outputPath === null) {
    var thispath = parts.join('/') + '/logs/';

    if(fs.existsSync(thispath)) {
      outputPath = thispath;
    } else {
      parts.pop();
    }
  }

  return outputPath;
};

class Process {
  constructor(name, config) {
    this.isFirstRun = true;
    this.filename = 'modules/' + name + '.js';
    this.logPrefix = name.replace(/\//g, "_");
    this.logPath = findLogPath();
    this.logEnabled = (this.logPath !== null);
    this.logFile = () => {
      var d = new Date();

      var date = d.getFullYear() + '_' +
        ((d.getMonth() + 1) + '').padStart(2, '0') + '_' +
        ((d.getDate() + 1) + '').padStart(2, '0') + '_';

      if(d.getHours() <= 11) {
        date += '00';
      } else {
        date += '12';
      }

      return this.logPath + this.logPrefix + '_' + date + '.log';
    };
    this.log = (string) => {
      var d = new Date();
      var n = d.toISOString();

      fs.appendFileSync(this.logFile(), '[' + n + '] ' + string);
    };

    if(config.basepath !== undefined && config.basepath.constructor == ''.constructor) {
      this.filename = config.basepath + '/' + this.filename;
    }

    if(config.verboseOutput !== undefined && config.verboseOutput) {
      this.verboseOutput = true;
    } else {
      this.verboseOutput = false;
    }

    this.run();
  }

  run() {
    if(this.verboseOutput) {
      console.log('[Process]', '[Run]', this.filename);
    }

    if(this.isFirstRun) {
      this.log('Loading ' + this.filename);
    } else {
      this.log('Reloading ' + this.filename);
    }

    var parent = this, child = spawn('node', [ this.filename ]);

    child.stdout.on('data', (data) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[stdout]', parent.filename, data.toString());
      }

      if(this.logEnabled) {
        this.log(data);
      }
    });

    child.stderr.on('data', (data) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[stderr]', parent.filename, data.toString());
      }

      if(this.logEnabled) {
        this.log(data);
      }
    });

    child.on('error', (err) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[Error]', parent.filename, err);
      }

      if(this.logEnabled) {
        this.log('Process Error');
      }
    });

    child.on('exit', (code) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[Exit]', parent.filename, code);
      }

      if(this.logEnabled) {
        this.log('Process Exited (' + code + ')');
      }

      setTimeout(() => {
        parent.run();
      }, 1000);
    });
  }
}

module.exports = Process;
