module.exports = {
	initActions: function () {
		let self = this
		let actions = {}

		let zoneOptions = []
		for (let i = 1; i <= self.currentState.internal.zones; i++) {
			let element = { id: i, label: i.toString() }
			zoneOptions.push(element)
		}

		let breakerOptions = []
		for (let i = 1; i <= self.currentState.internal.breakers; i++) {
			let element = { id: i, label: i.toString() }
			breakerOptions.push(element)
		}

		actions.breakerOn = {
			name: 'Breaker On',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions,
				},
			],
			callback: async function (action) {
				self.breakerChange(action.options.breaker, 1)
			},
		}

		actions.breakerOff = {
			name: 'Breaker Off',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions,
				},
			],
			callback: async function (action) {
				self.breakerChange(action.options.breaker, 0)
			},
		}

		actions.breakerToggle = {
			name: 'Breaker Toggle',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions,
				},
			],
			callback: async function (action) {
				let breakerState = self.currentState.dynamicVariables['breaker_' + action.options.breaker]

				if (breakerState == 'On') {
					self.breakerChange(action.options.breaker, 0)
				} else if (breakerState == 'Off') {
					self.breakerChange(action.options.breaker, 1)
				}
			},
		}

		actions.zoneOn = {
			name: 'Zone On',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions,
				},
			],
			callback: async function (action) {
				self.zoneChange(action.options.zone, 1)
			},
		}

		actions.zoneOff = {
			name: 'Zone Off',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions,
				},
			],
			callback: async function (action) {
				self.zoneChange(action.options.zone, 0)
			},
		}

		actions.zoneToggle = {
			name: 'Zone Toggle',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions,
				},
			],
			callback: async function (action) {
				let zoneState = self.currentState.dynamicVariables['zone_' + action.options.zone]

				if (zoneState == 'On') {
					self.zoneChange(action.options.zone, 0)
				} else if (zoneState == 'Off') {
					self.zoneChange(action.options.zone, 1)
				}
			},
		}

		self.setActionDefinitions(actions)
	},
}
