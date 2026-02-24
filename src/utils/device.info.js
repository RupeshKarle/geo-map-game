import { UAParser } from "ua-parser-js";

export const getDeviceInfo = (req) => {
 const userAgent = req.headers['user-agent'] || '';
 const parser = new UAParser(userAgent);
 const result = parser.getResult();

 return {
  browser: {
   name: result.browser.name || 'Unknown',
   version: result.browser.version || 'Unknown',
  },
  os: {
   name: result.os.name || 'Unknown',
   version: result.os.version || 'Unknown',
  },
  device: {
   type: result.device.type || 'desktop',
   model: result.device.model || 'Unknown',
   vendor: result.device.vendor || 'Unknown',
  },
  engine: {
   name: result.engine.name || 'Unknown',
   version: result.engine.version || 'Unknown',
  },
  cpu: {
   architecture: result.cpu.architecture || 'Unknown',
  },
  ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  userAgent,
 };
};