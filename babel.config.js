module.exports = (api) => {
    if (api.env("test")) {
        return {
            presets: [["@babel/preset-env", { targets: { node: "current" } }]],
        };
    }

    return {
        presets: [["@babel/env", { modules: false }]],
    };
};
