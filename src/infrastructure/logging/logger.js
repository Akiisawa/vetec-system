const ts = () => new Date().toISOString();
const log = (level, ...args) => console.log(`[${ts()}] [${level}]`, ...args);
module.exports = {
  info:  (...a) => log('INFO ', ...a),
  warn:  (...a) => log('WARN ', ...a),
  error: (...a) => log('ERROR', ...a),
  audit: (...a) => log('AUDIT', ...a),
};