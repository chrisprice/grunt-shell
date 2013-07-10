'use strict';
module.exports = function (grunt) {
	var exec = require('child_process').exec;
	var spawn = require('child_process').spawn;
	var _ = grunt.util._;

	grunt.registerMultiTask('shell', 'Run shell commands', function () {
		var cb = this.async();
		var options = this.options({
			stdout: false,
			stderr: false,
			failOnError: false,
			type: 'exec'
		});
		var cmd = this.data.command;

		if (cmd === undefined) {
			throw new Error('`command` is required.');
		}

		cmd = grunt.template.process(_.isFunction(cmd) ? cmd.call(grunt) : cmd);

		var cp;
		switch (options.type) {
			case 'exec':
				cp = exec(cmd, options.execOptions, function (err, stdout, stderr) {
					if (_.isFunction(options.callback)) {
						options.callback.call(this, err, stdout, stderr, cb);
					} else {
						if (err && options.failOnError) {
							grunt.warn(err);
						}
						cb();
					}
				});		
				break;
			case 'spawn':
				cp = spawn(cmd, options.spawnOptions);
				ls.on('error', function (err) {
					if (options.failOnError) {
						grunt.warn(err);
					}
					cb();
				});
				ls.on('close', function (code) {
					cb();
				});
				break;

		}

		grunt.verbose.writeln('Command:', cmd.yellow);
		grunt.verbose.writeflags(options, 'Options');

		if (options.stdout || grunt.option('verbose')) {
			cp.stdout.pipe(process.stdout);
		}

		if (options.stderr || grunt.option('verbose')) {
			cp.stderr.pipe(process.stderr);
		}
	});
};
