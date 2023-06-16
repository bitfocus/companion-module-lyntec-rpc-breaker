const { combineRgb } = require('@companion-module/base');

module.exports = {
	initFeedbacks: function () {
		let self = this;
		let feedbacks = {};

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red

		let zoneOptions = []
		for (let i =1; i <= self.currentState.internal.zones; i++) {
			zoneOptions.push({ id: i, label: i })
		}

		let breakerOptions = []
		for (let i =1; i <= self.currentState.internal.breakers; i++) {
			breakerOptions.push({ id: i, label: i })
		}

		feedbacks['breaker_state'] = {
			type: 'boolean',
			name: 'Change colors based on breaker state',
			description: 'Sets the background according to the state of the selected breaker',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 1,
					choices: [
						{ id: 2, label: "On" },
						{ id: 1, label: "Off" },
						{ id: 3, label: "Tripped" },
						{ id: 4, label: "Faulted" },
						{ id: 5, label: "Empty" },
						{ id: 6, label: "Manualy On"}
					]
				}
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0)
			},
			callback: async function(feedback) {
				let state = feedback.options.state;
	
				let breakerState = self.currentState.dynamicVariables['breaker_'+feedback.options.breaker];
	
				let stateNum = 5;
				
				switch (breakerState) {
					case "Off":
						stateNum = 1
						break;
					case "On":
						stateNum = 2
						break;
					case "Tripped":
						stateNum = 3
						break;
					case "Faulty":
						stateNum = 4
						break;
					case "Empty":
						stateNum = 5
						break;
					case "Manually On":
						stateNum = 6
						break;
					default:
						break;
				}
	
				if (stateNum == state) {
					return true;
				}
	
				return false;
			}
		};

		feedbacks['zone_state'] = {
			type: 'boolean',
			name: 'Change colors based on zone state',
			description: 'Sets the background according to the state of the selected zone',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 1,
					choices: [
						{ id: 2, label: "On" },
						{ id: 1, label: "Off" },
						{ id: 3, label: "Sequencing" },
					]
				}
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0)
			},
			callback: async function(feedback) {
				let state = feedback.options.state;
	
				let zoneState = self.currentState.dynamicVariables['zone_'+feedback.options.zone];
	
				let stateNum = 1;
				
				switch (zoneState) {
					case "Off":
						stateNum = 1
						break;
					case "On":
						stateNum = 2
						break;
					case "Sequencing":
						stateNum = 3
						break;
					default:
						break;
				}
	
				if (stateNum == state) {
					return true;
				}
	
				return false;
			}
		};

		self.setFeedbackDefinitions(feedbacks);
	}
}