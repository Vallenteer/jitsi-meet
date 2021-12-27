let apiKey = '';
let apiID = '';
let room = '';
let meetingId = '';
let myId = '';
let myName = '';
let quality = 720;
// let videoAPIURL = 'https://console.ngagevideoapi.com';
let videoAPIURL = 'https://console.videoapi.liveprod.cloud';
let constraint = {    
    status: false,
    text: {
        t1: '',
        t2: ''
    },
};

/* eslint-disable require-jsdoc */

export function getAPIKey() {
    return apiKey;
}

/* eslint-disable require-jsdoc */
export function getAPIID() {
    return apiID;
}

/* eslint-disable require-jsdoc */
export function setAPIKey(key) {
    apiKey = key;
}

/* eslint-disable require-jsdoc */
export function setAPIID(id) {
    apiID = id;
}

/* eslint-disable require-jsdoc */
export function setMyID(id) {
    myId = id;
}

/* eslint-disable require-jsdoc */
export function setMyName(name) {
    myName = name;
}

/* eslint-disable require-jsdoc */
export function getMyID() {
    return myId;
}

/* eslint-disable require-jsdoc */
export function getMyName() {
    return myName || '';
}

/* eslint-disable require-jsdoc */
export function setRoom(newRoom) {
    if (newRoom) {
        const checkRoom = newRoom.split('-');
        if (checkRoom.length > 4) {
            setRoom(room)
            return;
        }        

        room = newRoom.trim().replace(`${getAPIID()}-`, '').replace(`-${getAPIKey}`, '');
        
        if (room === 'null') {
            room = '';
        }
    }
}

/* eslint-disable require-jsdoc */
export function getRoom() {
    return room;
}

/* eslint-disable require-jsdoc */
export function isOKToReport() {
    return apiKey && apiID && room;
}

/* eslint-disable require-jsdoc */
export function getMeetingID() {
    return meetingId;
}
/* eslint-disable require-jsdoc */
export function setMeetingID(id) {
    meetingId = id;
}

/* eslint-disable require-jsdoc */
export function setCurrentPreferredVideoQuality(newQuality) {
    quality = newQuality;
}

/* eslint-disable require-jsdoc */
export function getCurrentPreferredVideoQuality() {
    return quality;
}


/* eslint-disable require-jsdoc */
export function setVideoAPIURL(url) {
    if (url) {
        videoAPIURL = url;
    }
}

/* eslint-disable require-jsdoc */
export function getVideoAPIURL() {
    return videoAPIURL;
}

/* eslint-disable require-jsdoc */
export function setConstraint(status, text) {
    const { t1, t2 } = text;
    constraint['status'] = status;
    constraint['text'] = {
        t1,
        t2
    };

    localStorage.setItem('constraint', JSON.stringify(constraint))
}

export function getConstraint() {
    const c = localStorage.getItem('constraint');
    if (c) {
        return JSON.parse(c);
    }
    return constraint;
}