import createInitCommand from '@liwei.com/init';
// import createInstallCommand from '@liwei.com/install';
// import createLintCommand from '@liwei.com/lint';
// import createCommitCommand from '@liwei.com/commit';
import createCLI from './createCLI.js';
import './exception.js';

export default function(args) {
    const program = createCLI();
    createInitCommand(program);
    // createInstallCommand(program);
    // createLintCommand(program);
    // createCommitCommand(program);
    program.parse(process.argv);
};
