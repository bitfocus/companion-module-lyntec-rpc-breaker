module.exports = {
	initVariables: function () {
		let self = this

		let variables = []

		for (let i = 1; i <= self.currentState.internal.breakers; i++) {
			let element = {
				name: 'Breaker #' + i + ' State',
				variableId: 'breaker_' + i,
			}
			variables.push(element)
		}

		for (let i = 1; i <= self.currentState.internal.zones; i++) {
			let element = {
				name: 'Zone #' + i + ' State',
				variableId: 'zone_' + i,
			}
			variables.push(element)
		}

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		try {
			let variableObj = {}

			for (let i = 1; i <= self.currentState.dynamicVariables.breakers; i++) {
				variableObj['breaker_' + i] = self.currentState.dynamicVariables['breaker_' + i]
			}

			for (let i = 1; i <= self.currentState.dynamicVariables.zones; i++) {
				variableObj['zone_' + i] = self.currentState.dynamicVariables['zone_' + i]
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			self.log('error', 'Error setting variables: ' + error)
		}
	},
}
