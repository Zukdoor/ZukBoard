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
      instances: '1',
      // log_date_format: 'YYYY-MM-DD HH:mm Z',
      // error_file: `./logs/node/${projectName}/err.log`,
      // out_file: `./logs/node/${projectName}/out.log`,
      // combine_logs: true,
      // merge_logs: true,
      // watch: false,
      // max_memory_restart: '1024M',
      env: {
        NODE_ENV: 'development'
      },
      env_heroku: {
        NODE_ENV: 'heroku'
      }
    }
  ]
}
