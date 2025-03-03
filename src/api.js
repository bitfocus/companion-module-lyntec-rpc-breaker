const { InstanceStatus, TCPHelper } = require('@companion-module/base')

module.exports = {
	init_tcp: function () {
		let self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		if (self.config.host) {
			self.commands = []

			if (self.config.port === undefined) {
				self.config.port = 23
			}
			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('error', function (err) {
				self.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				self.log('error', 'Network error: ' + err.message)
			})

			self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok)
			})

			self.socket.on('data', function (data) {
				let dataString = data.toString()
				let loginFound = dataString.search('Login:')
				let passFound = dataString.search('Password:')
				let commandPrompt = dataString.search(':>')

				let bytes = []

				if (loginFound >= 0) {
					if (self.socket !== undefined && self.socket.isConnected) {
						self.socket.send(self.config.user + '\r\n')
						self.log('debug', 'Sent Username')
					} else {
						self.log('debug', 'Socket not connected :(')
					}
					bytes = []
					self.stopZoneCheckTimer()
					self.stopTransmitTimer()
				} else if (passFound >= 0) {
					if (self.socket !== undefined && self.socket.isConnected) {
						self.socket.send(self.config.pass + '\r\n')
						self.log('debug', 'Sent password')
						self.connected = false
					} else {
						self.log('debug', 'Socket not connected :(')
					}
					bytes = []
					self.stopZoneCheckTimer()
				} else if (commandPrompt >= 0) {
					if (!self.connected) {
						if (self.socket !== undefined && self.socket.isConnected) {
							self.log('debug', 'Login Success')
							self.connected = true

							self.requestZones()
							self.requestBreakers()
							self.startTransmitTimer(10)
							self.startZoneCheckTimer(30000)
						} else {
							self.log('debug', 'Socket not connected :(')
						}
					}
					self.transmitOK = true
				}

				let cleanedString = dataString.replace(/\r|\n|:>/g, '')
				let array = Buffer.from(cleanedString, 'hex')

				let dataStringStart = false
				for (let i = 0; i < array.length; i++) {
					if (array[i] == 0xb0) {
						dataStringStart = true
						bytes = []
					} else if (array[i] == 0xf0) {
						if (dataStringStart & (array.length >= 2)) {
							self.processBytes(bytes)
						}
						bytes = []
						dataStringStart = false
					} else if (dataStringStart) {
						bytes.push(array[i])
					}
				}
			})
		}
	},

	emptyCurrentState: function () {
		let self = this

		let internal = {}
		if (self.currentState.internal != undefined) {
			internal = self.currentState.internal
		}

		self.currentState = {
			internal: internal,
			dynamicVariables: {},
		}

		if (self.currentState.internal.breakers.length > 0) {
			for (let i = 1; i <= self.currentState.internal.breakers; i++) {
				self.currentState.dynamicVariables['breaker_' + i] = 'Empty'
			}
		}

		if (self.currentState.internal.zones.length > 0) {
			for (let i = 1; i <= self.currentState.internal.zones; i++) {
				self.currentState.dynamicVariables['zone_' + i] = 'Off'
			}
		}

		self.checkVariables()
		self.checkFeedbacks()
	},

	processBytes: function (bytes) {
		let self = this
		let breakerRaw, stateRaw, zoneRaw, state

		if (bytes[0] == 0xc8) {
			//breaker Status
			//B0 C8 1F 02 F0
			for (let i = 1; i <= bytes.length; ) {
				if (bytes.length - i >= 2) {
					breakerRaw = bytes[i++]
					stateRaw = bytes[i++]

					switch (stateRaw) {
						case 1:
							state = 'Off'
							break
						case 2:
							state = 'On'
							break
						case 3:
							state = 'Tripped'
							break
						case 4:
							state = 'Faulty'
							break
						case 5:
							state = 'Empty'
							break
						case 6:
							state = 'Manually On'
							break
						default:
							break
					}

					self.currentState.dynamicVariables['breaker_' + breakerRaw] = state
				} else {
					i++
				}
			}
			self.checkVariables()
			self.checkFeedbacks('breaker_state')
		} //breaker Status

		if (bytes[0] == 0xc9) {
			//Zone Status
			for (let i = 1; i <= bytes.length; ) {
				if (bytes.length - i >= 2) {
					zoneRaw = bytes[i++]
					stateRaw = bytes[i++]
					switch (stateRaw) {
						case 1:
							state = 'Off'
							break
						case 2:
							state = 'On'
							break
						case 3:
							state = 'Sequencing'
							self.startZoneCheckTimer(1000)
							break
						default:
							break
					}

					self.currentState.dynamicVariables['zone_' + zoneRaw] = state
				} else {
					i++
				}
			}
			self.checkVariables()
			self.checkFeedbacks('zone_state')
		} //Zone Status

		if (bytes[0] == 0xb6) {
			//All Breaker Status
			let numOfBreakers = bytes[1]
			if (self.currentState.internal.breakers != numOfBreakers) {
				self.currentState.internal.breakers = numOfBreakers
				self.initVariables()
				self.actions()
				self.init_feedbacks()
				self.requestZones()
			}
			for (let i = 1; i <= numOfBreakers; i++) {
				let byteNum = i + 1
				if (byteNum < bytes.length) {
					let value = bytes[byteNum] & 0x0f

					state = ''
					switch (value) {
						case 1:
							state = 'Off'
							break
						case 2:
							state = 'On'
							break
						case 3:
							state = 'Tripped'
							break
						case 4:
							state = 'Faulty'
							break
						case 5:
							state = 'Empty'
							break
						case 6:
							state = 'Manually On'
							break
						default:
							break
					}

					self.currentState.dynamicVariables['breaker_' + i] = state
				}
			}
			self.checkVariables()
			self.checkFeedbacks('breaker_state')
		} //All Breaker Status

		if (bytes[0] == 0xb9) {
			//All Zone Status
			let sequencing = false
			let numOfZones = bytes[1]
			if (self.currentState.internal.zones != numOfZones) {
				self.currentState.internal.zones = numOfZones
				self.initVariables()
				self.actions()
				self.init_feedbacks()
				self.requestBreakers()
			}
			for (let i = 1; i <= numOfZones; i++) {
				let byteNum = i + 1
				if (byteNum < bytes.length) {
					let value = bytes[byteNum]
					state = 'N/A'
					switch (value) {
						case 1:
							state = 'Off'
							break
						case 2:
							state = 'On'
							break
						case 3:
							state = 'Sequencing'
							sequencing = true
							break
						default:
							break
					}

					self.currentState.dynamicVariables['zone_' + i] = state
				}
			}
			if (sequencing) {
				self.startZoneCheckTimer(1000)
			} else {
				self.startZoneCheckTimer(30000)
			}
			self.checkVariables()
			self.checkFeedbacks('zone_state')
		} //All Zone Status
	},

	requestZones: function () {
		//request zone status
		let self = this
		self.commands.push('B0B9F0')
	},

	requestBreakers: function () {
		//Request breaker status
		let self = this
		self.commands.push('B0B6F0')
	},

	breakerChange: function (breaker, state) {
		let self = this
		if (state == 0) {
			self.commands.push('B0B5' + self.decimalToHex(breaker, 2) + 'F0')
		} else if (state == 1) {
			self.commands.push('B0B4' + self.decimalToHex(breaker, 2) + 'F0')
		}
	},

	zoneChange: function (zone, state) {
		let self = this
		if (state == 0) {
			self.commands.push('B0B8' + self.decimalToHex(zone, 2) + 'F0')
		} else if (state == 1) {
			self.commands.push('B0B7' + self.decimalToHex(zone, 2) + 'F0')
		}
	},

	startZoneCheckTimer: function (timeout) {
		let self = this

		if (self.zoneCheckLastTimeout != timeout) {
			// Stop the timer if it was already running
			self.stopZoneCheckTimer()

			self.log('info', 'Starting zoneCheckTimer')
			// Create a reconnect timer to watch the socket. If disconnected try to connect.
			self.zoneCheckTimer = setInterval(function () {
				self.requestZones()
			}, timeout)
			self.zoneCheckLastTimeout = timeout
		}
	},

	stopZoneCheckTimer: function () {
		let self = this

		if (self.zoneCheckTimer !== undefined) {
			self.log('info', 'Stopping zoneCheckTimer')
			clearInterval(self.zoneCheckTimer)
			delete self.zoneCheckTimer
		}
	},

	startTransmitTimer: function (timeout) {
		let self = this

		// Stop the timer if it was already running
		self.stopTransmitTimer()

		self.log('info', 'Starting transmitTimer')
		// Create a reconnect timer to watch the socket. If disconnected try to connect.
		self.transmitTimer = setInterval(function () {
			self.transmitCommands()
		}, timeout)
	},

	stopTransmitTimer: function () {
		let self = this

		if (self.transmitTimer !== undefined) {
			self.log('info', 'Stopping transmitTimer')
			clearInterval(self.transmitTimer)
			delete self.transmitTimer
		}
	},

	transmitCommands: function () {
		let self = this

		if (self.transmitOK) {
			if (self.commands.length) {
				let command = self.commands.shift()
				if (self.socket !== undefined && self.socket.connected) {
					self.socket.send(command + '\r\n')
					self.log('debug', 'Sent Username')
				} else {
					self.log('debug', 'Socket not connected :(')
				}
				self.transmitOK = false
			}
		}
	},

	decimalToHex: function (d, padding) {
		let hex = Number(d).toString(16)
		padding = typeof padding === 'undefined' || padding === null ? (padding = 2) : padding

		while (hex.length < padding) {
			hex = '0' + hex
		}

		return hex
	},

	/*setupInterval: function() {
		let self = this;
	
		self.stopInterval();
	
		if (self.config.polling == true) {
			self.INTERVAL = setInterval(self.getState.bind(self), self.config.polling_rate);
			self.log('info', 'Starting Update Interval.');
		}
	},
	
	stopInterval: function() {
		let self = this;
	
		if (self.INTERVAL !== null) {
			self.log('info', 'Stopping Update Interval.');
			clearInterval(self.INTERVAL);
			self.INTERVAL = null;
		}
	},

	getState: function () {
		let self = this;
	}*/
}
