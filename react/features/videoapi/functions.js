import LibVideoAPI from '../base/lib-jitsi-meet';
import { getAPIID, getAPIKey, getVideoAPIURL } from './api';


/* eslint-disable require-jsdoc */
export function getDevices() {
    return new Promise((resolve, reject) => {
        try {
            LibVideoAPI.enumerateDevices(list => {
                resolve(list);
            });
        } catch (e) {
//            reject(e);
        }
    });
}

/* eslint-disable require-jsdoc */
export function getLocality() {
    try {
        return fetch('https://geolocation-db.com/json/')
        .then(response => response.json());
    } catch (e) {
        return {
            country_code: '-',
            country_name: '-',
            city: '-',
            IPv4: "-",
            latitude: 0,
            longitude: 0,
            postal: null,
            state: '-'
        }
    }
}

/* eslint-disable require-jsdoc */

export function getAPIInfo() {
    if (!window) {
        return;
    }

    if (!window.location) {
        return;
    }
    const pathname = window.location.pathname.replace('apiKey', '-');
    const apiIDs = pathname.substring(1).split('-');
    

    let params = {};

    if (window.location.search || window.location.hash) {
        const x = window.location.search || window.location.hash;

        const paramsStr =`{"${x.replace(/%22/g, '').replace(/&/g, '","').replace(/=/g,'":"')}"}`
        params = JSON.parse(paramsStr,
            function(key, value) { return key===""?value:decodeURIComponent(value) });
    }

    const data = {
        apiID: '',
        apiKey: params['apiKey'] || '',
        roomName: ''
    }



    if (window.location.host === 'room.videoapi') {
        data.apiKey = '00000000-0000-0000-0000-000000000000';
    } else if (params['id']) {
        const keyParams = params['id'].split('-');

        if (keyParams.length === 2) {
            const k = keyParams[0];

            data.apiKey = params['id'].replace(`${k}-`, '');
        }
    }

    if (apiIDs && apiIDs.length > 5) {
        apiIDs.map((item, i) => {
            if (i < 5) {
                data.apiID = data.apiID + item;
            }
            if (i < 4) {
                data.apiID = `${data.apiID}-`;
            }
            if (i === 5) {
                data.roomName = data.roomName + item;
            }
            if (i >= 6 && i <= apiIDs.length - 1) {                                
                data.apiKey = `${data.apiKey}-` + item;
                if (i === 6) {
                    data.apiKey = data.apiKey.replace('-', '');
                }
            }
        });
    }
    if (data.apiID === '') {
        data.apiID = 'default';
    }

    if (apiIDs && apiIDs.length > 0) {
        for (let i in apiIDs) {
            if (apiIDs[i].toUpperCase() === 'TEST') {
                data.apiID = 'TEST';
                break;
            }
        }
    }

    return data;
}

export async function checkRoomIsValid() {
    const videoAPIURL = getVideoAPIURL();
    const apiID = `${getAPIID()}`.replace('%7D', '');
    return fetch(`${videoAPIURL}/api/tenant/check-room/${apiID}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(ret => {  
        if (!ret.ok) {
            return false;
        }
        return ret.json();
    })
    .catch(e => {
        console.log(e);
        return false;
    });
}

export async function checkTenant() {
    const videoAPIURL = getVideoAPIURL();
    return fetch(`${videoAPIURL}/api/tenant/check/${getAPIID()}/${getAPIKey()}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(ret => {  
        if (!ret.ok) {
            return false;
        }
        return ret.json();
    })
    .catch(e => {
        console.log(e);
        return false;
    });
}

export async function checkExpiredTenantPackage() {
    const videoAPIURL = getVideoAPIURL();
    return fetch(`${videoAPIURL}/api/tenant/check-package-expired/${getAPIID()}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(ret => {  
        if (!ret.ok) {
            return false;
        }
        return ret.json();
    })
    .catch(e => {
        console.log(e);
        return false;
    });
}