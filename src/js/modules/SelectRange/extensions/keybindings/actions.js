export default {
	rangeJumpLeft: function(e){
		this.dispatch("keybinding-nav-range", e, "left", true, false);
	},
	rangeJumpRight: function(e){
		this.dispatch("keybinding-nav-range", e, "right", true, false);
	},
	rangeJumpUp: function(e){
		this.dispatch("keybinding-nav-range", e, "up", true, false);
	},
	rangeJumpDown: function(e){
		this.dispatch("keybinding-nav-range", e, "down", true, false);
	},
	rangeExpandLeft: function(e){
		this.dispatch("keybinding-nav-range", e, "left", false, true);
	},
	rangeExpandRight: function(e){
		this.dispatch("keybinding-nav-range", e, "right", false, true);
	},
	rangeExpandUp: function(e){
		this.dispatch("keybinding-nav-range", e, "up", false, true);
	},
	rangeExpandDown: function(e){
		this.dispatch("keybinding-nav-range", e, "down", false, true);
	},
	rangeExpandJumpLeft: function(e){
		this.dispatch("keybinding-nav-range", e, "left", true, true);
	},
	rangeExpandJumpRight: function(e){
		this.dispatch("keybinding-nav-range", e, "right", true, true);
	},
	rangeExpandJumpUp: function(e){
		this.dispatch("keybinding-nav-range", e, "up", true, true);
	},
	rangeExpandJumpDown: function(e){
		this.dispatch("keybinding-nav-range", e, "down", true, true);
	},
};
