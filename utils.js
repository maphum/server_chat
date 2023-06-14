const fs = require('fs')
const { spawn, exec } = require('child_process');
const axios = require('axios');

const resolutions = [180, 360, 720, 1080];

function parseCommandString(commandString) {
    // Split the command string into an array of space-separated tokens
    const tokens = commandString.split(/\s+/);
  
    const args = [];
  
    for (const token of tokens) {
      // Check if the token starts with a quote
      args.push(token)
    }
  
    return args;
}
  
const execFfmpeg = (roomId) => {
    // const cmd = `ffmpeg -i rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}  -async 1 -vsync -1 -c:v libx264 -acodec copy -b:v 256k -vf "scale=320:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_180 -c:v libx264 -acodec copy -b:v 256k -vf "scale=480:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_270 -c:v libx264 -acodec copy -b:v 768k -vf "scale=640:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_360 -c:v libx264 -acodec copy -b:v 1024k -vf "scale=960:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_540 -c:v libx264 -acodec copy -b:v 1920k -vf "scale=1280:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_720 -c:v libx264 -acodec copy -b:v 1920k -vf "scale=1920:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_1080`
    // const cmd = `ffmpeg -i rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}  -async 1 -vsync -1 -c:v libx264 -acodec copy -b:v 256k -vf "scale=320:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_180 -c:v libx264 -acodec copy -b:v 768k -vf "scale=640:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_360 -c:v libx264 -acodec copy -b:v 1920k -vf "scale=1280:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${roomId}_720`
    // exec(cmd, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(`error: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    // });
}

const makeFile = (roomId) => {
//     const content = 
//     `#EXTM3U
// #EXT-X-VERSION:3

// #EXT-X-STREAM-INF:BANDWIDTH=628000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=320x180,AUDIO="audio"
// live/${roomId}_180.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=928000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=480x270,AUDIO="audio"
// live/${roomId}_270.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=1728000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=640x360,AUDIO="audio"
// live/${roomId}_360.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=2528000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=960x540,AUDIO="audio"
// live/${roomId}_540.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=4928000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=1280x720,AUDIO="audio"
// live/${roomId}_720.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=9728000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=1920x1080,AUDIO="audio"
// live/${roomId}_1080.m3u8`
//     const content = `#EXTM3U
// #EXT-X-VERSION:3

// #EXT-X-STREAM-INF:BANDWIDTH=628000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=320x180,AUDIO="audio"
// live/${roomId}_180.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=1728000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=640x360,AUDIO="audio"
// live/${roomId}_360.m3u8
// #EXT-X-STREAM-INF:BANDWIDTH=4928000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=1280x720,AUDIO="audio"
// live/${roomId}_720.m3u8`
//     fs.writeFileSync(`objs/nginx/html/${roomId}.m3u8`, content)
}


const makeCmd = (name, resolutions) => {
    const firstCmd = `ffmpeg -i rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${name}  -async 1 -vsync -1`
    const backCmd = resolutions.reduce((prev, reso) => {
        let x = reso * 16 / 9
        return prev + `-c:v libx264 -acodec copy -b:v 256k -vf "scale=${x}:trunc(ow/a/2)*2" -tune zerolatency -preset veryfast -crf 23 -g 60 -hls_list_size 0 -f flv rtmp://127.0.0.1:1935/live?vhost=__defaultVhost__/${name}_${reso} `
    }, " ")
    return firstCmd + backCmd;
}

// Function to fetch and process data
const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:1985/api/v1/streams');
    // Process the data here
    return response.data.streams; 
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const checkRoomId = (name, rooms) => {
    return rooms.some(ele => ele.id === name);
}
const checkStreamInStreams = (name, streams) => {
    return streams.some(ele => ele.name === name)
}

async function streamMiddleWare(streams, rooms, io) {
    const sysStreams = await fetchData(); 
    if (!sysStreams) return; 
    let newStreams = sysStreams.filter(ele => ele.video != null).filter(ele => checkRoomId(ele.name, rooms)).map(ele => {
        return {
            name: ele.name,
            resolution: ele.video ?  ele.video.height : 720,
        }
    })
    console.log(newStreams)

    //disconnect
    streams.forEach(ele => {
        if (!checkStreamInStreams(ele.name, newStreams)) {
            //delete process
            console.log('stream out ', ele.name);
            io.to(ele.name).emit("link-update", { resolutions: [] });
            
            
            ele.process.kill();
        }
        else {
            for (let i = 0; i < newStreams.length; i++) {
                if (newStreams[i].name == ele.name) {
                    newStreams[i] = ele
                    break;
                }
            }
        }
    })
    //add
    newStreams = newStreams.map(ele => {
        if (!checkStreamInStreams(ele.name, streams)) {
            //make process handle trancode by on resolution 
            const newResolutions = resolutions.filter(reso => reso <= ele.resolution);
            const ffmpegCmd = makeCmd(ele.name, newResolutions); 
            const ffmpegProcess = exec(ffmpegCmd, (error, stdout, stderr) => {
                // if (error) {
                //     console.log(`error: ${error.message}`);
                //     return;
                // }
                // if (stderr) {
                //     console.log(`stderr: ${stderr}`);
                //     return;
                // }
                // console.log(`stdout: ${stdout}`);
            });
            console.log('new stream come ', ele.name)
            io.to(ele.name).emit("link-update", { resolutions: newResolutions });

            return {
                ...ele,
                process: ffmpegProcess,
                resolutions: newResolutions
            }
        }
        else return ele;
    })
    return newStreams;

}

module.exports = {
    makeFile,
    execFfmpeg,
    fetchData,
    streamMiddleWare,
}