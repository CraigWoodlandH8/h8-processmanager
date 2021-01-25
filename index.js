const { spawn } = require("child_process");

class Process {
  constructor(name) {
    this.filename = __dirname + 'modules/' + name + '.js';

    this.run();
  }

  run() {
    console.log('[Process]', '[Run]', this.filename);

    var parent = this, child = spawn('node', [ this.filename ]);

    child.on('error', (err) => {
      console.log('[Process]', '[Error]', this.filename, err);
    });

    child.on('exit', (code) => {
      console.log('[Process]', '[Exit]', this.filename, code);

      setTimeout(() => {
        parent.run();
      }, 1000);
    });
  }
}

module.exports = Process;
