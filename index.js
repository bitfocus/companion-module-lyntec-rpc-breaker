const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const api = require('./src/api')

class lyntecInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...api,
		})

		this.INTERVAL = null; //used to poll the device every second

		this.socket = undefined; //used for TCP communication

		this.commands = [];
		this.transmitOK = false;
		this.connected = false;
		this.transmitTimer = undefined;
		this.zoneCheckTimer = undefined;
		this.zoneCheckLastTimeout = 0

		this.currentState = {
			internal : {},
			dynamicVariables : {},
		};
	}

	async destroy() {
		let self = this;

		if (self.INTERVAL) {
			clearInterval(self.INTERVAL);
			self.INTERVAL = null;
		}

		if (self.socket !== undefined) {
			self.socket.send("q\r\n");
			self.socket.destroy();
		}
	
		self.stopZoneCheckTimer();
		self.stopTransmitTimer();
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		if (this.config.verbose) {
			this.log('info', 'Verbose mode enabled. Log entries will contain detailed information.');
		}
	
		this.updateStatus(InstanceStatus.Connecting);

		this.init_tcp();

		this.initActions();
		this.initFeedbacks();
		this.initVariables();
		this.initPresets();
	
		this.checkFeedbacks();
		this.checkVariables();
	}
}

runEntrypoint(lyntecInstance, UpgradeScripts);