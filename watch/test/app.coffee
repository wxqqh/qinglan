# watch demo
{ exec } = require 'child_process'
path = require 'path'

watch = require '../src/watch'

args = process.argv.splice 2
target = args[0] || ''

if target
	watch.run target, (e, file)->
		if e == 'change'
			exec path.resolve('test.bat'), ( err, stdout, stderr) ->
				throw err if err
				console.log stdout
else
	console.log 'Param path is null. Please user me like "coffee app.coffee (path)"'
