'use strict';

const utility  = require('../utility');

let appAddress = null;
let keyPair    = utility.createKeyPair({dump: true});

/**
 * 创建第三方 APP
 */
describe('create app', () => {
    it('should return a 200', (done) => {
        const payload = {
            name : 'Test APP ' + new Date(),
        };
        global.api.post(
            '/api/apps'
        ).send({payload: payload}).set(
            utility.getAuthHeader('/apps', payload, user.keystore, user.password)
        ).end((err, res) => {
            res.status.should.equal(200);
            appAddress = res.body && res.body.data && res.body.data.app && res.body.data.app.address;
            done();
        });
    });
});

/**
 * 获取 APP 基本信息
 */
describe('get app information', () => {
    it('should return a 200', (done) => {
        global.api.get(
            '/api/apps/' + appAddress
        ).set(
            utility.getAuthHeader('/apps/' + appAddress, undefined, user.keystore, user.password)
        ).set(
            'Accept', 'application/json'
        ).expect(200, done);
    });
});

/**
 * 更新 APP 基本信息
 */
describe('update app', () => {
    it('should return a 200', (done) => {
        const payload = {
            name : 'Test APP ' + new Date(),
        };
        global.api.post(
            '/api/apps/' + appAddress
        ).send({payload: payload}).set(
            utility.getAuthHeader('/apps/' + appAddress,
            payload, user.keystore, user.password)
        ).expect(200, done);
    });
});

/**
 * 删除 APP
 */
describe('delete app', () => {
    it('should return a 200', (done) => {
        const payload = {};
        global.api.post(
            '/api/apps/' + appAddress + '/delete'
        ).send({payload: payload}).set(
            utility.getAuthHeader('/apps/' + appAddress + '/delete',
            payload, user.keystore, user.password)
        ).expect(200, done);
    });
});

/**
 * 创建新密钥，并授权 app 通过此密钥签名文件，发布信息
 */
describe('auth app', () => {
    it('should return a 200', (done) => {
        const appAdd  = 'db197f667770a18ae038a89d460eddda05734f4c';
        const key     = keyPair;
        const payload = {
            appAddress  : appAdd,
            authAddress : key.address,
            authorized  : true,
        };
        const message = utility.rollObject(payload);
        const sign    = utility.signText(message, user.keystore, user.password);
        const data    = {
            payload : payload,
            sig     : sign.sig,
        };
        // const
        global.api.post(
            '/api/apps/authenticate'
        ).send(data).expect(200, done);
    });
});

/**
 * 取消对 app 的授权，将不能再通过此密钥签名新文件
 */
describe('deauth app', () => {
    it('should return a 200', (done) => {
        const appAdd  = 'db197f667770a18ae038a89d460eddda05734f4c';
        const key     = keyPair;
        const payload = {
            appAddress  : appAdd,
            authAddress : key.address,
            authorized  : false,
        };
        const message = utility.rollObject(payload);
        const sign    = utility.signText(message, user.keystore, user.password);
        const data    = {
            payload : payload,
            sig     : sign.sig,
        };
        // const
        global.api.post(
            '/api/apps/deauthenticate'
        ).send(data).expect(200, done);
    });
});
