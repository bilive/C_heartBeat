"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class roomHeartBeat extends plugin_1.default {
    constructor() {
        super();
        this.name = '模拟心跳';
        this.description = '模拟直播间心跳, 可获取小心心和观看时长';
        this.version = '0.0.2';
        this.author = 'lzghzr';
    }
    async load({ defaultOptions, whiteList, version }) {
        if (version === undefined || version.major !== 3) {
            plugin_1.tools.Log('模拟心跳', '主程序版本不兼容', '需要3.0.0以上');
            this.loaded = false;
        }
        else {
            defaultOptions.newUserData['roomHeartBeat'] = false;
            defaultOptions.info['roomHeartBeat'] = {
                description: '模拟心跳',
                tip: '是否模拟心跳',
                type: 'boolean'
            };
            whiteList.add('roomHeartBeat');
            defaultOptions.newUserData['roomHeartBeatRoomID'] = 3;
            defaultOptions.info['roomHeartBeatRoomID'] = {
                description: '模拟心跳的房间',
                tip: '模拟心跳的房间, 默认为3(官方音乐台)',
                type: 'number'
            };
            whiteList.add('roomHeartBeatRoomID');
            this.loaded = true;
        }
    }
    async start({ users }) {
        for (const [_uid, user] of users) {
            if (user.userData['roomHeartBeat']) {
                this._heartBeat(user);
                await plugin_1.tools.Sleep(5 * 1000);
            }
        }
    }
    _sign(postJSON, secretRule) {
        let sign = JSON.stringify(postJSON);
        for (const i of secretRule) {
            switch (i) {
                case 1:
                    sign = plugin_1.tools.Hash('SHA256', sign);
                    break;
                case 2:
                    sign = plugin_1.tools.Hash('SHA384', sign);
                    break;
                case 3:
                    sign = plugin_1.tools.Hash('SHA512', sign);
                    break;
                case 4:
                    sign = plugin_1.tools.Hash('SHA3-224', sign);
                    break;
                case 5:
                    sign = plugin_1.tools.Hash('SHA3-256', sign);
                    break;
                case 6:
                    sign = plugin_1.tools.Hash('SHA3-384', sign);
                    break;
                case 7:
                    sign = plugin_1.tools.Hash('SHA3-512', sign);
                    break;
                case 8:
                    sign = plugin_1.tools.Hash('BLAKE2b512', sign);
                    break;
                case 9:
                    sign = plugin_1.tools.Hash('BLAKE2s256', sign);
                    break;
                case 10:
                    sign = plugin_1.tools.Hash('RIPEMD160', sign);
                    break;
                case 11:
                    sign = plugin_1.tools.Hash('whirlpool', sign);
                    break;
                default:
                    sign = plugin_1.tools.Hash('SHA224', sign);
                    break;
            }
        }
        return sign;
    }
    async _heartBeat(user) {
        if (!user.userData['status'] || !user.userData['roomHeartBeat'] || !user.userData['roomHeartBeatRoomID'])
            return;
        const roomID = user.userData['roomHeartBeatRoomID'];
        const roomPlayInfoXHRoptions = {
            url: `https://api.live.bilibili.com/xlive/app-room/v1/roomPlay/getRoomPlayInfo?${plugin_1.AppClient.signBaseQuery(`${user.tokenQuery}&https_url_req=1&play_url=0&ptype=0&qn=0&room_id=${roomID}`)}`,
            responseType: 'json',
            headers: user.headers
        };
        const getRoomPlayInfo = await plugin_1.tools.XHR(roomPlayInfoXHRoptions, 'Android');
        if (getRoomPlayInfo !== undefined && getRoomPlayInfo.response.statusCode === 200 && getRoomPlayInfo.body.code === 0) {
            const roomInfoXHRoptions = {
                url: `https://api.live.bilibili.com/xlive/app-room/v1/index/getInfoByRoom?${plugin_1.AppClient.signBaseQuery(`${user.tokenQuery}&room_id=${roomID}`)}`,
                responseType: 'json',
                headers: user.headers
            };
            const getRoomInfo = await plugin_1.tools.XHR(roomInfoXHRoptions, 'Android');
            if (getRoomInfo !== undefined && getRoomInfo.response.statusCode === 200 && getRoomInfo.body.code === 0) {
                const roomPlayInfoData = getRoomPlayInfo.body.data;
                const roomInfoData = getRoomInfo.body.data;
                const postJSON = {
                    platform: user.platform,
                    uuid: plugin_1.AppClient.UUID,
                    buvid: user.build,
                    seq_id: '1',
                    room_id: roomInfoData.room_info.room_id.toString(),
                    parent_id: roomInfoData.room_info.parent_area_id.toString(),
                    area_id: roomInfoData.room_info.area_id.toString(),
                    timestamp: '',
                    secret_key: '',
                    watch_time: '',
                    up_id: roomInfoData.room_info.uid.toString(),
                    up_level: roomInfoData.anchor_info.live_info.level.toString(),
                    jump_from: '30000',
                    gu_id: plugin_1.AppClient.RandomHex(43),
                    play_type: '0',
                    play_url: roomPlayInfoData.play_url || '',
                    s_time: '0',
                    data_behavior_id: '',
                    data_source_id: '',
                    up_session: roomInfoData.room_info.up_session,
                    visit_id: plugin_1.AppClient.RandomHex(32),
                    watch_status: encodeURIComponent('{"pk_id":0,"screen_status":1}'),
                    click_id: '',
                    session_id: '-99998',
                    player_type: '0',
                    client_ts: ''
                };
                this._postMobileEntry(user, postJSON);
            }
            else {
                await plugin_1.tools.Sleep(10 * 1000);
                this._heartBeat(user);
            }
        }
        else {
            await plugin_1.tools.Sleep(10 * 1000);
            this._heartBeat(user);
        }
    }
    async _postMobileEntry(user, postJSON) {
        if (!user.userData['status'] || !user.userData['roomHeartBeat'] || !user.userData['roomHeartBeatRoomID'])
            return;
        const mobileEntryXHRoptions = {
            method: 'POST',
            url: 'https://live-trace.bilibili.com/xlive/data-interface/v1/heartbeat/mobileEntry',
            body: plugin_1.AppClient.signBaseQuery(`${user.tokenQuery}&area_id=${postJSON.area_id}&buvid=${user.buvid}&client_ts=${plugin_1.AppClient.TS}&heart_beat=${encodeURIComponent('[]')}&is_patch=0&parent_id=${postJSON.parent_id}&room_id=${postJSON.room_id}&seq_id=${postJSON.seq_id}&uuid=${postJSON.uuid}`),
            responseType: 'json',
            headers: user.headers
        };
        const postMobileEntry = await plugin_1.tools.XHR(mobileEntryXHRoptions, 'Android');
        if (postMobileEntry !== undefined && postMobileEntry.response.statusCode === 200 && postMobileEntry.body.code === 0) {
            const postMobileEntryData = postMobileEntry.body.data;
            postJSON.secret_key = postMobileEntryData.secret_key;
            postJSON.timestamp = postMobileEntryData.timestamp.toString();
            postJSON.watch_time = postMobileEntryData.heartbeat_interval.toString();
            await plugin_1.tools.Sleep(postMobileEntryData.heartbeat_interval * 1000);
            this._postHearBeat(user, postJSON, postMobileEntryData.secret_rule);
        }
        else {
            await plugin_1.tools.Sleep(10 * 1000);
            this._heartBeat(user);
        }
    }
    async _postHearBeat(user, postJSON, secretRule) {
        if (!user.userData['status'] || !user.userData['roomHeartBeat'] || !user.userData['roomHeartBeatRoomID'])
            return;
        postJSON.client_ts = plugin_1.AppClient.TS.toString();
        const clientSign = this._sign(postJSON, secretRule);
        let postData = '';
        for (const i in postJSON)
            postData += `${i}=${encodeURIComponent(postJSON[i])}&`;
        postData += `client_sign=${clientSign}`;
        const mobileHeartBeatXHRoptions = {
            method: 'POST',
            url: 'https://live-trace.bilibili.com/xlive/data-interface/v1/heartbeat/mobileHeartBeat',
            body: user.signQuery(`${user.tokenQuery}&${postData}`),
            responseType: 'json',
            headers: user.headers
        };
        const postMobileHeartBeat = await plugin_1.tools.XHR(mobileHeartBeatXHRoptions, 'Android');
        if (postMobileHeartBeat !== undefined && postMobileHeartBeat.response.statusCode === 200 && postMobileHeartBeat.body.code === 0) {
            const postMobileHeartBeatData = postMobileHeartBeat.body.data;
            postJSON.secret_key = postMobileHeartBeatData.secret_key;
            postJSON.timestamp = postMobileHeartBeatData.timestamp.toString();
            postJSON.watch_time = postMobileHeartBeatData.heartbeat_interval.toString();
            await plugin_1.tools.Sleep(postMobileHeartBeatData.heartbeat_interval * 1000);
            this._postHearBeat(user, postJSON, postMobileHeartBeatData.secret_rule);
        }
        else {
            await plugin_1.tools.Sleep(10 * 1000);
            this._heartBeat(user);
        }
    }
}
exports.default = new roomHeartBeat();
