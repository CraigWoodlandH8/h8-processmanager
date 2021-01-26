const { spawn } = require("child_process");

class Process {
  constructor(name, basedir, verboseOutput) {
    this.filename = 'modules/' + name + '.js';

    if(basedir !== undefined) {
      this.filename = basedir + '/' + this.filename;
    }

    if(verboseOutput !== undefined && verboseOutput) {
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

    var parent = this, child = spawn('node', [ this.filename ]);

    child.stdout.on('data', (data) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[stdout]', parent.filename, data.toString());
      }
    });

    child.stderr.on('data', (data) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[stderr]', parent.filename, data.toString());
      }
    });

    child.on('error', (err) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[Error]', parent.filename, err);
      }
    });

    child.on('exit', (code) => {
      if(parent.verboseOutput) {
        console.log('[Process]', '[Exit]', parent.filename, code);
      }

      setTimeout(() => {
        parent.run();
      }, 1000);
    });
  }
}

module.exports = Process;
