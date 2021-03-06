'use strict';

const path = require('path');

const yargs = require('yargs');

const { pathExists } = require('fs-extra');
const actions = require('../../lib/spectacle/actions');
const ACTIONS = Object.keys(actions);

// Produce args object.
const args = () =>
  yargs
    .usage('Usage: spectacle -s <file>')

    // Substantive
    .option('action', {
      alias: 'a',
      describe: `CLI action to run (${ACTIONS.join(', ')})`,
      default: 'server',
      type: 'string'
    })
    .option('src', {
      alias: 's',
      describe: 'Path to a file from which a presentation will be generated.',
      default: 'slides.mdx',
      type: 'string'
    })
    .option('theme', {
      alias: 't',
      describe: 'Path to a JS/JSON file with theme overrides.',
      type: 'string'
    })
    .option('title', {
      alias: 'l',
      describe: 'Title for the HTML file generated by the Spectacle CLI.',
      type: 'string',
      default: 'Presentation'
    })
    .option('template', {
      alias: 'q',
      describe:
        'The path for a template file that gets included on each slide.',
      type: 'string'
    })
    .option('port', {
      alias: 'p',
      describe: 'Port for running the Spectacle development server.',
      type: 'number',
      default: 3000
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory for built files.',
      type: 'string',
      default: 'dist'
    })

    // Logistical
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .strict().argv;

// Validate and further transform args.
// eslint-disable-next-line max-statements
const parse = async argv => {
  const { action, src, theme, port, title, template } = argv;

  // Action.
  if (!actions[action]) {
    throw new Error(`Unknown action: "${action}"`);
  }

  // Source. Relative to CWD.
  if (!/\.mdx?$/.test(src)) {
    throw new Error(
      `Only .md,.mdx files are supported for --src. Found: "${src}"`
    );
  }
  const srcFilePath = path.resolve(src);
  const srcExists = await pathExists(srcFilePath);
  if (!srcExists) {
    throw new Error(`Source file "${srcFilePath}" not found.`);
  }

  // Theme. Relative to CWD.
  let themeFilePath;
  if (theme) {
    themeFilePath = path.resolve(theme);
    const themeExists = await pathExists(themeFilePath);
    if (!themeExists) {
      throw new Error(`Theme file "${themeFilePath}" not found.`);
    }
  }

  let templateFilePath;
  if (template) {
    templateFilePath = path.resolve(template);
    const templateExists = await pathExists(templateFilePath);
    if (!templateExists) {
      throw new Error(`Template file "${templateFilePath}" not found.`);
    }
  }

  return {
    action,
    port,
    title,
    srcFilePath,
    themeFilePath,
    templateFilePath
  };
};

module.exports = {
  parse: () => parse(args())
};
