import program from 'commander';
import execa from 'execa';
import Listr from 'listr';



program
    .version('0.1.0')
    .command('update <submodule>')
    .option('-ch, --commitHash [commitHash]', 'commit id')
    .action((submodule, args) => {
        const branch: string = 'develop';

        new Listr([
            {
                title: `Fetch ALL upstream`,
                task: () => execa.shell(`git fetch upstream --recurse-submodules --prune`)
            },
            {
                title: `Checkout: "${submodule}:${branch}"`,
                task: () => execa.shell(`cd ${submodule} && git checkout ${branch}`)
            },
            {
                title: `Checkout "${submodule}:${branch}:${args.commitHash}"`,
                skip: () => args.commitHash === undefined || args.commitHash === null,
                task: () => execa.shell(`cd ${submodule} && git checkout ${args.commitHash}`)
            },
            {
                title: `Stage "${submodule}"`,
                task: () => execa.shell(`git add ${submodule}`)
            },
            {
                title: `Commit "${submodule}"`,
                task: ctx => execa.shell(`git commit -m "Update submodule ${submodule}"`)
                    .catch(() => {
                        ctx.nothingToCommit = true;
                    })
            },
            {
                title: `Pushing to remote`,
                skip: ctx => ctx.nothingToCommit,
                task: () => execa.shell(`git push`)
            }
        ]).run().then(() => {
            execa.shell(`git log --oneline -n 1 ${submodule}`)
                .then(result => {
                    console.log(`${submodule} is now pointing to:`);
                    console.log(result.stdout);
                });
        }).catch(error => {
            console.error("Error:", error);
        });
    });

program.parse(process.argv);