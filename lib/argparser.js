var argv = require("argv");

argv.option({
    name: 'downsync',
    short: 'ds',
    type: 'boolean',
    description: 'Download all photos and information architecture from Flickr',
    example: "'script --downsync --user=yourname"
});

argv.option({
    name: 'user',
    short: 'u',
    type: 'string',
    description: 'The username for which to downsync content',
    example: "'script --downsync --user=yourname"
});

argv.option({
    name: 'prune',
    short: 'ds',
    type: 'boolean',
    description: 'Remove any local photos that got deleted on Flickr',
    example: "'script --downsync --user=yourname --prune"
});

module.exports = argv.run().options;
