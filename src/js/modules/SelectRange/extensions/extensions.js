import bindings from './keybindings/bindings.js';
import actions from './keybindings/actions.js';
import pasteActions from './clipboard/pasteActions.js';
import pasteParsers from './clipboard/pasteParsers.js';

export default {
	keybindings:{
		bindings:bindings,
		actions:actions
	},
	clipboard:{
		pasteActions:pasteActions,
		pasteParsers:pasteParsers
	},
};