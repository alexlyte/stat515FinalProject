var promise = require('promise');
var csv_loader = require('./csv.loader.js');
var file1 = 'updated_beeradvocate.csv';
var file2 = 'updated_beermenu.csv';
var geocoder = require('geocoder');
var async = require('async-q')
// filtered out duplicate beers
// assigned a unique id to each

csv_loader
.load(file1)
.then(function(beerlist1) {
	var beerzz = [];
	var beer_check = {};
	var beer_ids = {};
	beerlist1.forEach(function(d){

		// for every unique beer
		// get it's new id and map it. 
		// then, while it's still in mem, 
		// loop through the beermenu list
		// and for each beer, grab its id 
		// and map it to the new list id

		var new_id = create_new_id(d);
		if(!beer_check[new_id]){
			d.new_id = new_id;
			beer_ids[d.beer_id] = new_id;
			beer_check[new_id] = true;
			beerzz.push(d);
		}
	});

	csv_loader
	.load(file2)
	.then(function(beerlist2) {

		var bar_addrs = {};
		beerlist2.forEach(function(d){
			d.new_id = beer_ids[d.beer_id];
			if(d.lat == ''){
				bar_addrs[d.location] = true;
			}
		});

		var baaz = Object.keys(bar_addrs);

		console.log(beerlist2[0])



		get_geocodes(baaz)
		.then(function(good){
			// console.log(good)
			try{
				beerBackup = {};
				beerlist2.forEach(function(b){

					if(good[b.location]){
						beerBackup[b.location] = good[b.location];
						b.lat = good[b.location].lat;
						b.lng = good[b.location].lng;						
					} else {
						// console.log(good[b.location])
						// console.log(b.location)
						if(beerBackup[b.location]){
							b.lat = beerBackup[b.location].lat;
							b.lng = beerBackup[b.location].lng;							
						}
					}
				})



				csv_loader
				.write(beerzz, './updated_beeradvocate.csv')
				.then(function(good){
					console.log('updated beeradvocate.csv')


					var beer_locs = {};
					beerlist2.forEach(function(d){
						if(d.lat !== ''){
							beer_locs[d.location] = {lat : d.lat, lng : d.lng}
						} else {
							if(beer_locs[d.location]){
								d.lat = beer_locs[d.location].lat;
								d.lng = beer_locs[d.location].lng;
							}
						}
					})
					beerlist2.forEach(function(d){
						if(d.lat !== ''){
							beer_locs[d.location] = {lat : d.lat, lng : d.lng}
						} else {
							if(beer_locs[d.location]){
								d.lat = beer_locs[d.location].lat;
								d.lng = beer_locs[d.location].lng;
							}
						}
					})


					csv_loader
					.write(beerlist2, './updated_beermenu.csv')
					.then(function(good){
						console.log('good')
					}, function(bad){
						console.log(bad)
						console.log('shit')
					})
				})

			} catch(e){
				console.log(e)
			}

		}, function(bad){
			console.log(bad)
			console.log('shit')
		})

	}, function(bad){
		console.log(bad)
	})
}, function(bad){
	console.log(bad)
})


var get_geocodes = function(list){
	return new promise(function(resolve, reject){
		async
		.mapSeries(list, geocod_this)
		.then(function(results) {
			var baa_lats = {};
			results.forEach(function(d){
				var key = Object.keys(d)[0];
				baa_lats[key] = d[key];
			})
			resolve(baa_lats)
		}).done();
	})	
}


var geocod_this = function(loc){
	return new promise(function(resolve, reject){
		geocoder.geocode(loc, function ( err, data ) {
			if(err){
				reject(err)
			} else {
				var res = {};
				if(data.results.length > 0){
					res[loc] = data.results[0].geometry.location;
					resolve(res)					
				} else { 
					resolve({
						lat : null,
						lng : null
					})
				}
			}
		});
	})
}


var create_new_id = function(item){
	try {
		var objStr = Math.abs(item.User.hashCode());
		return(objStr)
	} catch(e){
		console.log(e)
	}
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};