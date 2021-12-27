import statsEmitter from '../../features/connection-indicator/statsEmitter';
import { appNavigate } from '../app/actions';
import { APP_WILL_MOUNT } from '../base/app';
import { CONFERENCE_JOINED, CONFERENCE_LEFT, CONFERENCE_WILL_JOIN, CONFERENCE_WILL_LEAVE, getCurrentConference, PARTICIPANT_LEFT, SET_ROOM } from '../base/conference';
import { CONNECTION_ESTABLISHED, CONNECTION_WILL_CONNECT } from '../base/connection';
import { LIB_DID_INIT } from '../base/lib-jitsi-meet';
import { getLocalParticipant, PARTICIPANT_JOINED, PARTICIPANT_UPDATED } from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { SET_MAX_RECEIVER_VIDEO_QUALITY, SET_PREFERRED_VIDEO_QUALITY } from '../video-quality';

import { getAPIID, getMeetingID, getMyID, getMyName, setAPIID, setAPIKey, setCurrentPreferredVideoQuality, setMeetingID, setMyID, setMyName, setRoom, setVideoAPIURL, setConstraint } from './api';
import { getAPIInfo, checkTenant, checkRoomIsValid, checkExpiredTenantPackage } from './functions';
import { checkStats, reportSignIn, reportTimestamp, sendReport } from './stats';
import { disconnect } from '../base/connection';

export function initCheckStats(store) {
    const state = store.getState();
    const participant = getLocalParticipant(state);

    statsEmitter.subscribeToClientStats(participant.id, checkStats);
}

async function checkValidRoom(store) {
    const text = {};
    const roomIsValid = await checkRoomIsValid();
    if (getAPIID() === 'default') {
        return true;
    }    
    if (roomIsValid.Status === false) {
        text.t1 = 'The rooms currently running have reached your subscription limit';
        text.t2 = 'Please upgrade your subscription to use more rooms at the same time';

        setConstraint(true, text);
        store.dispatch(disconnect(true));
        return false;           
    }

    return true;
}


async function checkValidTenant(store) {
    const state = store.getState();
    const conference = getCurrentConference(state);

    localStorage.removeItem('constraint');
    const now = new Date().getTime();          
    const tenant = await checkTenant();
    const tenantPackageExpired = await checkExpiredTenantPackage();
    let redirectToWelcomePage = false;    
    const text = {};        
    const isRecorder = state['features/base/participants'].length === conference.getParticipantCount();
    console.warn('[CONFERENCE_JOINED] state: ', state);
    console.warn('[CONFERENCE_JOINED] isRecorder: ', isRecorder);
    console.warn('[CONFERENCE_JOINED] participantCount: ', conference.getParticipantCount());
    console.warn('[CONFERENCE_JOINED] participantCount from state: ', state['features/base/participants'].length);  
    console.warn('[CONFERENCE_JOINED] tenant status: ', tenant);      

    if (tenantPackageExpired.Status === true) {
        text.t1 = 'The package has expired or is not yet valid';
        text.t2 = '';

        setConstraint(true, text);
        store.dispatch(disconnect(true));
        return false;           
    }

    if (tenant === false ) {
        
        text.t1 = 'Your API ID and API Key is invalid';
        text.t2 = 'Please verify your API ID and API Key from console dashboard';

        setConstraint(true, text);
        redirectToWelcomePage = true;
        
    } else if (tenant?.overquota) {
        text.t1 = 'You have run out of package quota';
        text.t2 = 'Please contact you account manager to continue using the services';

        setConstraint(true, text);
        redirectToWelcomePage = true;
    } else if (tenant?.end_time > now) {
        text.t1 = 'Your package is expired';
        text.t2 = 'Please contact you account manager to continue using the services';

        setConstraint(true, text);
        redirectToWelcomePage = true;
    }
    
    if (redirectToWelcomePage === true) {
        store.dispatch(disconnect(true));
        return false;
    }
    return true;
}



function waitAndHangup(store, conference) {
    setTimeout(() => {
        if (conference && conference.getParticipantCount() === 1) {
            const data = {};

            data.type = 'auto-exit';
            data.timestamp = Date.now();
            data.participantId = getMyID();
            data.participantName = getMyName();

            const payload = {
                tenant_id: getAPIID(),
                session_id: getMeetingID(),
                room: getRoom(),
                metrics: JSON.stringify(data)
            };

            sendReport(payload);

            reportTimestamp('CONFERENCE_WILL_LEAVE');
            reportSignIn();

            if (navigator.product === 'ReactNative') {
                store.dispatch(appNavigate(undefined));
            } else {
                store.dispatch(disconnect(true));
            }
        }
    }, 5 * 60 * 1000);
}


export function waitForMeetingID(store, cb) {
    setTimeout(() => {
        const conference = getCurrentConference(store.getState());
        console.warn('[waitForMeetingID]: conference: ', conference);
        console.warn('[waitForMeetingID]: getParticipants: ', conference.getParticipantCount());

        if (conference.getMeetingUniqueId() === undefined) {
            waitForMeetingID(store, cb);
        } else {
            const meetingId = conference.getMeetingUniqueId();
            if (!meetingId) {
                waitForMeetingID(store, cb);

                return;
            }
            setMeetingID(meetingId);
            setMyID(conference.myUserId());
            conference.getParticipants()
            .map(member => {
                if (member.getId() === getMyID() && getMyName() === '') {
                    setMyName(member.getDisplayName());
                }
            });
            initCheckStats(store);
            cb(store);
        }
    }, 500);
}



MiddlewareRegistry.register(store => next => async action => {
    /* eslint-disable no-fallthrough */
    switch (action.type) {
    case APP_WILL_MOUNT:
        if (action.app && action.app.props && action.app.props.url) {
            setAPIID(action.app.props.url.apiID);
            setAPIKey(action.app.props.url.apiKey);
        } else {
            const apiInfo = getAPIInfo();

            if (apiInfo.apiID) {
                setAPIID(apiInfo.apiID);
            }
            if (apiInfo.apiKey) {
                setAPIKey(apiInfo.apiKey);
            }
            if (apiInfo.roomName) {
                setRoom(apiInfo.roomName)
            }
        }

        break;


    case CONFERENCE_JOINED:
        reportTimestamp(action.type);
        waitForMeetingID(store, async () => {
            checkStats({});

            if (navigator.product !== 'ReactNative' && getAPIID() !== 'TEST') {  
                await checkValidRoom(store);
                console.warn('[CONFERENCE_JOINED] action: ', action);
                await checkValidTenant(store);
            }
            reportSignIn();
        });
        break;

    case SET_MAX_RECEIVER_VIDEO_QUALITY:
        break;
    case PARTICIPANT_JOINED:
        if (navigator.product !== 'ReactNative') {    
            console.warn('[PARTICIPANT_JOINED] store: ', store);
            console.warn('[PARTICIPANT_JOINED] action: ', action);
            console.warn('[PARTICIPANT_JOINED] state: ', store.getState());

            const roomIsValid = checkValidRoom(store);                   
            
            if (roomIsValid) {
                document.dispatchEvent(new CustomEvent('videoapi-update-all-videos'));
            }
        }
        break;

    case PARTICIPANT_LEFT:
        {
            const { conference } = action.participant;
            console.warn('[PARTICIPANT_LEFT]: ', action.participant);

            if (conference && conference.getParticipantCount() === 1) {
                waitAndHangup(store, conference);
            }
            if (navigator.product !== 'ReactNative') {

                checkValidRoom(store);
                document.dispatchEvent(new CustomEvent('videoapi-update-all-videos'));
            }
        }
        break;

    case PARTICIPANT_UPDATED:
        if (action.participant && action.participant.name !== undefined && action.participant.name !== getMyName()) {
            setMyName(action.participant.name);
        }
        break;

    case CONNECTION_ESTABLISHED:                      
        reportTimestamp(action.type);
        break;
    case CONNECTION_WILL_CONNECT:
    case CONFERENCE_WILL_JOIN:                
        reportTimestamp(action.type);
        break;

    case CONFERENCE_LEFT:
        if (navigator.product === 'ReactNative') {
            global.lastExit = Date.now();
        }
        break;

    case LIB_DID_INIT:
        const state = store.getState()
        const {
            videoapiURL
        } = state['features/base/config'];

        reportTimestamp(action.type);
        setVideoAPIURL(videoapiURL);
        break;

    case CONFERENCE_WILL_LEAVE:
        reportTimestamp(action.type);
        reportSignIn();

        break;

    case SET_ROOM:
        setRoom(action.room);
        break;

    case SET_PREFERRED_VIDEO_QUALITY:
        setCurrentPreferredVideoQuality(action.preferredVideoQuality);
        break;

    default:
        break;
    }

    return next(action);
});

