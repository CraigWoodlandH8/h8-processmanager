const { spawn } = require("child_process");

class Process {
  constructor(name, basedir) {
    this.filename = 'modules/' + name + '.js';

    if(basedir !== undefined) {
      this.filename = basedir + '/' + this.filename;
    }

    this.run();
  }

  run() {
    console.log('[Process]', '[Run]', this.filename);

    var parent = this, child = spawn('node', [ this.filename ]);

    child.stdout.on('data', (data) => {
      console.log('[Process]', '[stdout]', parent.filename, data);
    });

    child.stderr.on('data', (data) => {
      console.log('[Process]', '[stderr]', parent.filename, data);
    });

    child.on('error', (err) => {
      console.log('[Process]', '[Error]', parent.filename, err);
    });

    child.on('exit', (code) => {
      console.log('[Process]', '[Exit]', parent.filename, code);

      setTimeout(() => {
        parent.run();
      }, 1000);
    });
  }
}

module.exports = Process;
