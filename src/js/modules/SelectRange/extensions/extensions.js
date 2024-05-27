import bindings from './keybindings/bindings.js';
import actions from './keybindings/actions.js';
import pasteActions from './clipboard/pasteActions.js';
import pasteParsers from './clipboard/pasteParsers.js';
import columnLookups from './export/columnLookups.js';
import rowLookups from './export/rowLookups.js';

export default {
	keybindings:{
		bindings:bindings,
		actions:actions
	},
	clipboard:{
		pasteActions:pasteActions,
		pasteParsers:pasteParsers
	},
	export:{
		columnLookups:columnLookups,
		rowLookups:rowLookups,
	}
};