var mongoose = require('mongoose');
var config = require('../config');

var Schema = mongoose.Schema;

mongoose.connect('mongodb://' + config.host + '/' + config.dbname);

var roomSchema = new Schema({
	title: String,
	type: Number,
	startTime: { type: Date, default: Date.now },
	periodTime: Number,
	status: { type: Number, default: 1 },
	addition: Schema.Types.Mixed
});

roomSchema.statics.getAll = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.find({status: 1}, function(err, rooms) {
			if (err) reject(err);
			else resolve(rooms);
		});
	});
}

roomSchema.statics.getOneByName = function(name) {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.findOne({title: name}, function(err, room) {
			if (err) reject(err);
			else resolve(room);
		});
	});
};

roomSchema.statics.close = function(name) {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.getOneByName(name).then(function(room) {
			room.status = 0;
			room.uploadAndSave().then(resolve, reject);
		})
	});
};

roomSchema.methods.uploadAndSave = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.save(function(err, result) {
			if (err) reject(err);
			else resolve(result);
		})
	});
};

var RoomModel = mongoose.model('Room', roomSchema);

var room = new RoomModel({
	title: 'test50',
	type:  1,
	status: 1,
	periodTime: 20000,
	addition: ['gan', 1, 10]
});

room.uploadAndSave().then(function(result) {
	console.log(result);
});

// RoomModel.getAll().then(function(result) {
// 	console.log(result);
// });

// RoomModel.getOneByName('test3').then(function(result) {
// 	console.log(result);
// })

// RoomModel.close('test3').then(function(result) {
// 	console.log(result);
// })



module.exports = RoomModel;