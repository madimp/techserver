function EventEmitter(){}

EventEmitter.prototype = {
	emit: function(type, data, callback){
		if (data == void 0){
			data = {};
		}

		var listeners = this.listeners(type);

		if (!listeners){
			if (callback){
				callback();
			}
			return;
		}

		listeners = listeners.slice();

		var waitFor = listeners.length;

		for (var i = 0, l = waitFor; i < l; i++){
			var listener = listeners[i];

			if (typeof listener === 'function') {
				try {
					listener.call(this, data, callback);
				} catch(e){
					isDone();
				}
			}
		}
	},

	listeners: function(type){
		return this._events && this._events[type] && this._events[type].length && this._events[type];
	},

	addListener: function(type, listener){
		if ('function' !== typeof listener){
			throw new Error('invalid argument');
		}

		if (!this._events){
			this._events = {};
		}

		if (!this._events[type]){
			this._events[type] = [];
		}
		this._events[type].push(listener);

		this.emit('newlistener', {type: type});

		return this;
	},

	once: function(type, listener) {
		if ('function' !== typeof listener){
			throw new Error('invalid argument');
		}

		function fn(){
			this.removeListener(type, fn);
			listener.apply(this, arguments);
		}

		//listener.__once = fn;
		this.on(type, fn);

		return this;
	},

	removeListener: function(type, listener){
		if ('function' !== typeof listener){
			throw new Error('invalid argument');
		}

		if (!this._events[type]){
			return this;
		}

		var listeners = this._events[type],
			index = lib.ArrayIndexOf(listeners, listener);

		if (index < 0){
			return this;
		}

		listeners.splice(index, 1);

		if (listeners.length === 0){
			delete this._events[type];
		}

		return this;
	}
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.Event = function(type, data){
	this.type = type;
	this.data = data;
};

EventEmitter.relay = function(events, from, to){
	for (var i = 0, l = events.length; i < l; i++){
		var event = events[i];

		from.on(event, (function(event){
			return function(e, next){
				to.emit(event);
			};
		})(event));
	}
};
