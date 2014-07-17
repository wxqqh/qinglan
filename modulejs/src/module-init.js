// init
define("module:init", function(require) {
	var init = function () {
		require("module:extLoader");
		require.addPlugin(require("module:plugin"));
		require.addPlugin(require("module:subModule"));
		require.addPlugin(require("module:method"));
		require.addPlugin(require("module:param"));
	};

	init();
});


