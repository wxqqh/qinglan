fs = require 'fs'
path = require 'path'

log = (msg) ->
	console.log msg

doWatch = (dir, cb) ->
	log "watching path '" + dir + "'"
	fs.watch dir, 
		persistent: true
		interval: 1000,
		(e, filename) ->
			log ' Event is: ' + e
			if filename
				log 'file hit : ' + dir + ' ' + filename
			else 
				log 'file permission denied'
			cb && cb.apply null, arguments

findAll = (dir, cb) ->
	dir = path.resolve dir
	fs.stat dir, (e, stats) ->
		if e
			log 'Error get stats for dir: ' + dir
		else
			if stats.isDirectory()
				cb && cb.call null, dir
				fs.readdir dir, (_e, fileNames) ->
					if _e
						log 'Error reading path: ' + dir
					else
						fileNames.forEach (filename) ->
							findAll path.join(dir, filename), cb

run = (target, cb) ->
	findAll target, (dir)->
		doWatch dir, ()->
			cb && cb.apply null, arguments


exports.run = run
