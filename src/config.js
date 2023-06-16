const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		let self = this;

		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module allows control of LynTec RPC panels running version 1.01 of the LynTec Telnet Server'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP of LynTec RPC Panel',
				width: 6,
				regex: Regex.IP
			},
			{
				type: 'textinput',
				id: 'user',
				label: 'Username of LynTec RPC Panel',
				width: 6
			},
			{
				type: 'textinput',
				id: 'pass',
				label: 'Password of LynTec RPC Panel',
				width: 6
			},
			/*{
				type: 'static-text',
				id: 'info2',
				label: 'Verbose Logging',
				width: 12,
				value: `
					<div class="alert alert-info">
						Enabling this option will put more detail in the log, which can be useful for troubleshooting purposes.
					</div>
				`
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false,
				width: 12
			},*/
		]
	}
}