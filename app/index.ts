import program from 'commander';
import execa from 'execa';
import Listr from 'listr';



program
    .version('0.1.0')
    .command('update <submodule>')
    .action((submodule) => {
        const branch: string = 'develop';

        new Listr([
            {
                title: `Checkout ${submodule}:${branch}`,
                task: () => execa.shell(`cd ${submodule} && git checkout ${branch}`)
            },
            {
                title: `Fetch and rebase ${submodule}`,
                task: () => execa.shell(`git submodule update ${submodule} --remote --rebase`)
            },
            {
                title: `Stage ${submodule}`,
                task: () => execa.shell(`git add ${submodule}`)
            },
            {
                title: `Commit ${submodule}`,
                task: () => execa.shell(`git commit -m "Update submodule ${submodule}"`)
            },
            {
                title: `Pushing to remote`,
                task: () => execa.shell(`git push`)
            },
            {
                title: `Commit of ${submodule} is now pointing to:`,
                task: () => execa.shell(`git log --oneline -n 1 ${submodule}`)
                    .then(result => { console.log(result.stdout); })
            }
        ]).run().catch(error => {
            console.error("Error:", error);
        });
    });

program.parse(process.argv);