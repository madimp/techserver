function Connector(conf){
	conf || (conf = {});

	this.socket = io.connect(conf.remote);
	var self = this;

	this._readyFns = [];
	this._connected = false;

	this._query = new FnQuery();
	this._query.store();

	if (conf.server){
		this._setFnList(conf.server);
	}

	this.socket.on('disconnect', function(){
		self._connected = false;
		self._query.store();
		self.emit('disconnect');
	});

	this.socket.on('connect', function(){
		if (!self.isReady()){
			self.socket.emit('getFnList', function(fnList){
				self._fnList = fnList;
				self._setFnList(fnList);

				self._setReady();
				self._connected = true;
				self.emit('connect');
				self._query.run();
			});

			self.socket.on('sms', function(data, answer){
				self.emit(data.type, data.data, answer);
			});

		} else {
			self._connected = true;
			self.emit('reconnect');
			self._query.run();
		}
	});
}

$.extend(Connector.prototype, new EventEmitter, {
	send: function(type, data, answer){
		if (!answer && typeof data == 'function'){
			answer = data;
			data = void 0;
		}

		this.socket.emit('sms', {type: type, data: data}, function(data){
			answer && answer(data);
		})
	},

	isReady: function(){
		return this._isReady;
	},

	onReady: function(fn){
		if (this.isReady()){
			fn.call(this);
		} else {
			this._readyFns.push(fn);
		}
	},

	_setReady: function(){
		for (var i = 0, l = this._readyFns.length; i < l; i++){
			var fn = this._readyFns[i];

			fn.call(this);
		}

		this._readyFns = [];

		this._isReady = true;
	},

	_setFnList: function(fnList){
		var self = this;

		for (var i = 0, l = fnList.length; i < l; i++){
			var name = fnList[i];

			if (!(name in self)){
				self[name] = (function(name){
					return function(data, answer){
						self._query.add(function(){
							if (self._fnList.indexOf(name) == -1){
								answer && answer('Error: undefined function');
								return;
							}

							if (!answer && typeof data == 'function'){
								answer = data;
								data = void 0;
							}

							self.socket.emit('fnCall', {
								name: name,
								data: data
							}, answer);

						});
					};
				})(name);
			}
		}
	}
});
