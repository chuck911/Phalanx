var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var boomSchema = new Schema({
	room: String,
	sender: String,
	content: String,
	roomTime: Number,
	time: {type: Date, default: Date.now}
});

boomSchema.methods.uploadAndSave = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.save(function(err, result) {
			if (err) return reject(err);
			resolve(result);
		});
	});
};

boomSchema.statics.getByRoom = function(room) {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.find({room: room}, function(err, result) {
			if (err) reject(err);
			else resolve(result);
		});
	});
};

var BoomModel = mongoose.model('Boom', boomSchema);

module.exports = BoomModel;