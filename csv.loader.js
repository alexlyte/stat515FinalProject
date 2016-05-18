var csv = require('csv');
var fs = require('fs');
var promise = require('promise');

exports.load = function(path) {
	return new promise(function(resolve, reject){
		try{
			var file = fs.readFileSync(path);
			csv.parse(file, function(err, data){
				var dta = [];
				var fields = data[0]
				for (var i = data.length - 1; i >= 1; i--) {					
					var newObj = {};
					fields.forEach(function(f,j){
						newObj[f] = data[i][j]
					})
					dta.push(newObj)
				}
				resolve(dta)
			});					
		} catch(e){
			reject(e)
		}
	})
};

exports.write = function(data, path){
	return new promise(function(resolve, reject){
		csv.stringify(data,{header: true}, function(err, dta){
		  if(err){
		  	reject(err)
		  } else{
		  	fs.writeFileSync(path, dta)
		    resolve('file saved')
		  }
	    });
    });
}

