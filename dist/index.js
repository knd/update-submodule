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
            title: "Fetch ALL upstream",
            task: function () { return execa_1.default.shell("git fetch upstream --recurse-submodules --prune"); }
        },
        {
            title: "Checkout: \"" + submodule + ":" + branch + "\"",
            task: function () { return execa_1.default.shell("cd " + submodule + " && git checkout " + branch); }
        },
        {
            title: "Checkout \"" + submodule + ":" + branch + ":" + args.commitHash + "\"",
            skip: function () { return args.commitHash === undefined || args.commitHash === null; },
            task: function () { return execa_1.default.shell("cd " + submodule + " && git checkout " + args.commitHash); }
        },
        {
            title: "Stage \"" + submodule + "\"",
            task: function () { return execa_1.default.shell("git add " + submodule); }
        },
        {
            title: "Commit \"" + submodule + "\"",
            task: function (ctx) { return execa_1.default.shell("git commit -m \"Update submodule " + submodule + "\"")
                .catch(function () {
                ctx.nothingToCommit = true;
            }); }
        },
        {
            title: "Pushing to remote",
            skip: function (ctx) { return ctx.nothingToCommit; },
            task: function () { return execa_1.default.shell("git push"); }
        }
    ]).run().then(function () {
        execa_1.default.shell("git show " + submodule)
            .then(function (result) {
            console.log(submodule + " is now pointing to:");
            console.log(result.stdout);
        });
    }).catch(function (error) {
        console.error("Error:", error);
    });
});
commander_1.default.parse(process.argv);
//# sourceMappingURL=index.js.map