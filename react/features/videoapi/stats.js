import { Platform } from '../base/react';
import { getAPIID, getMeetingID, getMyID, getMyName, getRoom, getVideoAPIURL } from './api';
import { getDevices, getLocality } from './functions';

const timestamps = {};

/* eslint-disable require-jsdoc */

export async function reportSignIn() {

    const data = {};

    data.type = 'join';
    data.timestamp = Date.now();
    data.platform = Platform.constants;
    if (data.platform) {
        delete data.platform.reactNativeVersion;
        data.platform.os = Platform.OS;
    } else {
        data.platform = {
            os: `Web ${Platform.OS || ''}`
        };
    }

    data.devices = await getDevices();
    data.locality = await getLocality();

    data.timestamps = timestamps;
    data.participantId = getMyID();
    data.participantName = getMyName();


    const payload = {
        tenant_id: getAPIID(),
        session_id: getMeetingID(),
        room: getRoom(),
        metrics: JSON.stringify(data)
    };

    sendReport(payload);
}

export async function reportTimestamp(event) {
    timestamps[event] = Date.now();
}

export async function clearTimestamps() {
    Object.keys(timestamps).map(item => delete timestamps[item]);
}

export async function checkStats(event) {

    const framerate = event.framerate;
    const codec = event.codec;
    const resolution = event.resolution;

    if (framerate) {
        event.framerate = framerate[Object.keys(framerate)[0]];
    }

    if (resolution) {
        event.resolution = resolution[Object.keys(resolution)[0]];
    }

    if (codec) {
        event.codec = codec[Object.keys(codec)[0]];
    }

    const data = {};

    data.type = 'stats';
    data.devices = await getDevices();
    data.timestamp = Date.now();
    data.participantId = getMyID();
    data.participantName = getMyName();

    data.event = event;

    data.platform = Platform.constants;
    if (data.platform) {
        delete data.platform.reactNativeVersion;
        data.platform.os = Platform.OS;
    } else {
        data.platform = {
            os: `Web ${Platform.OS || ''}`
        };
    }


    const payload = {
        tenant_id: getAPIID(),
        session_id: getMeetingID(),
        room: getRoom(),
        metrics: JSON.stringify(data)
    };

    sendReport(payload);
}

export function sendReport(payload) {
    const videoAPIURL = getVideoAPIURL();

    console.log('xxx report', payload);


    fetch(`${videoAPIURL}/api/conf/stats`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(ret => {
        if (!ret.ok) {
            throw new Error(ret.status);
        }
    })
    .catch(e => {
        console.log('xxx', e);
    });
}
