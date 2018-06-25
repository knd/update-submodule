import program from 'commander';
import execa from 'execa';
import Listr from 'listr';



program
    .version('0.5.2')
    .command('update <submodule>')
    .option('-C, --commitHash [commitHash]', 'commit id')
    .option('-b, --branch [updateSubmoduleBranch]', 'create update submodule branch from "develop" branch')
    .action((submodule, args) => {
        const developBranch: string = 'develop';

        new Listr([
            {
                title: `Fetch ALL upstream`,
                skip: () => false,
                task: ctx => execa.shell(`git fetch upstream --recurse-submodules --prune`)
                    .catch(() => {
                        ctx.abort = true;
                    })
            },
            {
                title: `Checkout: "${submodule}:${developBranch}"`,
                skip: ctx => ctx.abort,
                task: ctx => execa.shell(`cd ${submodule} && git checkout ${developBranch}`)
                    .catch(() => {
                        ctx.abort = true;
                    })
            },
            {
                title: `Checkout "${submodule}:${developBranch}:${args.commitHash}"`,
                skip: ctx => ctx.abort || args.commitHash === undefined || args.commitHash === null,
                task: ctx => execa.shell(`cd ${submodule} && git checkout ${args.commitHash}`)
                    .catch(() => {
                        ctx.abort = true;
                    })
            },
            {
                title: `Create update submodule branch "${args.branch}" from "develop"`,
                skip: ctx => ctx.abort || args.branch === undefined || args.branch === null,
                task: ctx => execa.shell(`git checkout ${developBranch} && git branch -D ${args.branch} && git checkout -b ${args.branch}`)
                    .catch(() => {
                        ctx.abort = true;
                    })
            },
            {
                title: `Stage "${submodule}"`,
                skip: ctx => ctx.abort,
                task: ctx => execa.shell(`git add ${submodule}`)
                    .catch(() => {
                        ctx.abort = true;
                    })
            },
            {
                title: `Commit "${submodule}"`,
                skip: ctx => ctx.abort,
                task: ctx => execa.shell(`git commit -m "Update submodule ${submodule}"`)
                    .catch(() => {
                        ctx.abort = true;
                    })
            },
            {
                title: `Pushing to remote`,
                skip: ctx => ctx.abort,
                task: ctx => execa.shell(`git push`)
            }
        ]).run().then(() => {
            execa.shell(`git show ${submodule}`)
                .then(result => {
                    console.log(`${submodule} is now pointing to:`);
                    console.log(result.stdout);
                });
        }).catch(error => {
            console.error("Error:", error);
        });
    });

program.parse(process.argv);