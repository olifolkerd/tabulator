module.exports = (api) => {
    if (api.env("test")) {
        return {
            presets: [
                ["@babel/preset-env", { targets: { node: "current" } }],
                "@babel/preset-typescript",
            ],
        };
    }

    return {
        presets: [["@babel/env", { modules: false }]],
    };
};
