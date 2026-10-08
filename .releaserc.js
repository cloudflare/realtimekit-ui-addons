const baseConfig = {
  tagFormat: '@cloudflare/realtimekit-ui-addons-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        tarballDir: 'release',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}\n\n\nskip-checks: true',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: 'release/*.tgz',
      },
    ],
  ],
  repositoryUrl: 'https://github.com/cloudflare/realtimekit-ui-addons',
};

const config = {
  ...baseConfig,
  branches: ['main', { name: 'staging', prerelease: true }],
};

export default config;
