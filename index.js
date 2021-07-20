const TrackingService = require('track-anything');
const os = require('os');
const disk = require('diskusage');
const osu = require('os-utils');
const config = require('./config/track_anything_server_monitoring');

async function getWorkloadJSON() {
    const freeMemory = os.freemem()/1000000;
    const totalMemory = os.totalmem()/1000000;
    return {
        memoryUsage:  Math.round(10000 * (totalMemory - freeMemory) / totalMemory) / 100,
        cpuUsage: Math.round(10000 * (await new Promise(resolve => osu.cpuUsage(resolve))))/100,
        diskSpaceUsage: Math.round(10000 * (await new Promise(resolve => disk.check('/', (err, info) => resolve((info.total - info.free) / info.total)))))/100,
    }
}

const start = async () => {
    const data = await getWorkloadJSON();
    const track = {
        type: 'hardwareMonitoring',
        applicationKey: config.applicationKey,
        value: JSON.stringify(data),
    };
    TrackingService.sendGenericTrack(track);
    console.log('Track sent!');
};

TrackingService.initialize(config.monitoringTrackingKey);
setInterval(start, config.intervallTime);
