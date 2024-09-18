const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this

		let presets = []

		const foregroundColor = combineRgb(255, 255, 255) // White
		const foregroundColorBlack = combineRgb(0, 0, 0) // Black
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Red

		for (let i = 1; i <= self.currentState.internal.breakers; i++) {
			let element = {
				type: 'button',
				category: 'Breaker Toggle',
				name: 'This button tells breaker ' + i + ' to toggle its state depending on the recieved state.',
				style: {
					text: 'Breaker ' + i + '\\n$(LynTec:breaker_' + i + ')',
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'breakerToggle',
								options: {
									breaker: i,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'breaker_state',
						options: {
							fg: combineRgb(0, 0, 0),
							bg: combineRgb(0, 255, 0),
							state: 2, //On State
							breaker: i,
						},
					},
					{
						feedbackId: 'breaker_state',
						options: {
							fg: combineRgb(0, 0, 0),
							bg: combineRgb(0, 204, 0),
							state: 6, //Manualy On State
							breaker: i,
						},
					},
					{
						feedbackId: 'breaker_state',
						options: {
							fg: combineRgb(0, 0, 0),
							bg: combineRgb(255, 0, 0),
							state: 3, //Tripped State
							breaker: i,
						},
					},
					{
						feedbackId: 'breaker_state',
						options: {
							fg: combineRgb(0, 0, 0),
							bg: combineRgb(255, 0, 0),
							state: 4, //Faulty State
							breaker: i,
						},
					},
				],
			}
			presets.push(element)
		}

		for (let i = 1; i <= self.currentState.internal.zones; i++) {
			let element = {
				type: 'button',
				category: 'Zone Toggle',
				name: 'This button tells zone ' + i + ' to toggle its state depending on the recieved state.',
				style: {
					text: 'Zone ' + i + '\\n$(LynTec:zone_' + i + ')',
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zoneToggle',
								options: {
									zone: i,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'zone_state',
						options: {
							state: 2, //On
							fg: combineRgb(0, 0, 0),
							bg: combineRgb(0, 255, 0),
							zone: i,
						},
					},
					{
						feedbackId: 'zone_state',
						options: {
							state: 3, //Sequencing
							fg: combineRgb(255, 255, 255),
							bg: combineRgb(102, 153, 255),
							zone: i,
						},
					},
				],
			}
			presets.push(element)
		}

		self.setPresetDefinitions(presets)
	},
}
