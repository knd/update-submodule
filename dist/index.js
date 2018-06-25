#!/usr/bin/env node

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var execa_1 = __importDefault(require("execa"));
var listr_1 = __importDefault(require("listr"));
commander_1.default
    .version('0.1.0')
    .command('update <submodule>')
    .option('-ch, --commitHash [commitHash]', 'commit id')
    .action(function (submodule, args) {
    var branch = 'develop';
    new listr_1.default([
        {
            title: "Checkout " + submodule + ":" + branch,
            task: function () { return execa_1.default.shell("cd " + submodule + " && git checkout " + branch); }
        },
        {
            title: "Fetch and rebase " + submodule,
            task: function () { return execa_1.default.shell("git submodule update " + submodule + " --remote --rebase"); }
        },
        {
            title: "Checkout " + submodule + ":" + branch + ":" + args.commitHash,
            skip: function () { return args.commitHash === undefined || args.commitHash === null; },
            task: function () { return execa_1.default.shell("cd " + submodule + " && git checkout " + args.commitHash); }
        },
        {
            title: "Stage " + submodule,
            task: function () { return execa_1.default.shell("git add " + submodule); }
        },
        {
            title: "Commit " + submodule,
            task: function () { return execa_1.default.shell("git commit -m \"Update submodule " + submodule + "\""); }
        },
        {
            title: "Pushing to remote",
            task: function () { return execa_1.default.shell("git push"); }
        },
        {
            title: "Commit of " + submodule + " is now pointing to:",
            task: function () { return execa_1.default.shell("git log --oneline -n 1 " + submodule)
                .then(function (result) { console.log(result.stdout); }); }
        }
    ]).run().catch(function (error) {
        console.error("Error:", error);
    });
});
commander_1.default.parse(process.argv);
//# sourceMappingURL=index.js.map