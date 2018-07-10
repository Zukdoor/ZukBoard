const projectName = require('./package.json').name

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: projectName,
      script: './app.js',
      watch: true,
      max_memory_restart: '1024M',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: `/data/logs/node/${projectName}/err.log`,
      out_file: `/data/logs/node/${projectName}/out.log`,
      combine_logs: true,
      merge_logs: true,
      env: {
        NODE_ENV: 'development'
      },
      env_testing: {
        NODE_ENV: 'testing'
      },
      env_simulation: {
        NODE_ENV: 'simulation'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],
  deploy: {
    testing: {
      user: 'root',
      host: '47.94.80.19',
      ref: 'origin/release',
      repo: 'ssh://git@39.104.53.64:2222/kuggaboard/kugga-board-web.git',
      path: `/data/${projectName}`,
      'post-deploy': 'git pull && npm install --production && ENABLE_NODE_LOG=YES pm2 start ecosystem.config.js --env testing '
    }
  }
}
