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
    .version('0.5.3')
    .command('update <submodule>')
    .option('-C, --commitHash [commitHash]', 'commit id')
    .option('-b, --branch [updateSubmoduleBranch]', 'create update submodule branch from "develop" branch')
    .action(function (submodule, args) {
    var developBranch = 'develop';
    new listr_1.default([
        {
            title: "Fetch ALL upstream",
            skip: function () { return false; },
            task: function (ctx) { return execa_1.default.shell("git fetch upstream --recurse-submodules --prune")
                .catch(function () {
                ctx.abort = true;
            }); }
        },
        {
            title: "Checkout: \"" + submodule + ":" + developBranch + "\"",
            skip: function (ctx) { return ctx.abort; },
            task: function (ctx) { return execa_1.default.shell("cd " + submodule + " && git checkout " + developBranch)
                .catch(function () {
                ctx.abort = true;
            }); }
        },
        {
            title: "Checkout \"" + submodule + ":" + developBranch + ":" + args.commitHash + "\"",
            skip: function (ctx) { return ctx.abort || args.commitHash === undefined || args.commitHash === null; },
            task: function (ctx) { return execa_1.default.shell("cd " + submodule + " && git checkout " + args.commitHash)
                .catch(function () {
                ctx.abort = true;
            }); }
        },
        {
            title: "Check out \"develop\" branch",
            skip: function (ctx) { return ctx.abort || args.branch === undefined || args.branch === null; },
            task: function (ctx) { return execa_1.default.shell("git checkout " + developBranch)
                .catch(function () {
                ctx.abort = true;
            }); }
        },
        {
            title: "Create new branch update submodule",
            skip: function (ctx) { return ctx.abort || args.branch === undefined || args.branch === null; },
            task: function (ctx) { return execa_1.default.shell("git checkout -b " + args.branch)
                .catch(function (err) {
                ctx.abort = true;
                console.log(err);
            }); }
        },
        {
            title: "Stage \"" + submodule + "\"",
            skip: function (ctx) { return ctx.abort; },
            task: function (ctx) { return execa_1.default.shell("git add " + submodule)
                .catch(function () {
                ctx.abort = true;
            }); }
        },
        {
            title: "Commit \"" + submodule + "\"",
            skip: function (ctx) { return ctx.abort; },
            task: function (ctx) { return execa_1.default.shell("git commit -m \"Update submodule " + submodule + "\"")
                .catch(function () {
                ctx.abort = true;
            }); }
        },
        {
            title: "Pushing to remote",
            skip: function (ctx) { return ctx.abort; },
            task: function (ctx) { return execa_1.default.shell("git push"); }
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