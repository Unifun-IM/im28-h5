import { IMError } from './errors.js';
import { createEventBus } from './events.js';
class BaseIMClient {
    config;
    events;
    eventEmitter;
    connectionState = 'idle';
    sessionState = {
        userID: null,
        loggedIn: false,
    };
    initialized = false;
    destroyed = false;
    transport;
    unsubscribeTransportMessages = null;
    constructor(config, options = {}) {
        this.config = config;
        this.transport = options.transport;
        this.eventEmitter = createEventBus();
        this.events = this.eventEmitter;
    }
    async init() {
        this.assertNotDestroyed();
        if (this.initialized) {
            return;
        }
        this.setConnectionState('initializing');
        await this.transport?.init();
        this.bindTransportEvents();
        this.initialized = true;
        this.setConnectionState('disconnected');
    }
    async login(params) {
        this.assertNotDestroyed();
        this.assertInitialized();
        this.assertLoginParams(params);
        this.setConnectionState('connecting');
        await this.transport?.login(params);
        this.setSessionState({
            userID: params.userID,
            loggedIn: true,
        });
        this.setConnectionState('connected');
    }
    async logout() {
        this.assertNotDestroyed();
        await this.transport?.logout();
        this.setSessionState({
            userID: null,
            loggedIn: false,
        });
        this.setConnectionState(this.initialized ? 'disconnected' : 'idle');
    }
    async destroy() {
        this.unsubscribeTransportMessages?.();
        this.unsubscribeTransportMessages = null;
        this.setSessionState({
            userID: null,
            loggedIn: false,
        });
        this.setConnectionState('idle');
        this.initialized = false;
        this.destroyed = true;
        this.eventEmitter.clear();
    }
    async sendTextMessage(params) {
        this.assertReadyForTransportCall();
        return this.transport.sendTextMessage(params);
    }
    async sendImageMessage(params) {
        this.assertReadyForTransportCall();
        return this.transport.sendImageMessage(params);
    }
    async sendVideoMessage(params) {
        this.assertReadyForTransportCall();
        return this.transport.sendVideoMessage(params);
    }
    async sendSoundMessage(params) {
        this.assertReadyForTransportCall();
        return this.transport.sendSoundMessage(params);
    }
    async sendFileMessage(params) {
        this.assertReadyForTransportCall();
        return this.transport.sendFileMessage(params);
    }
    async getSelfUserInfo() {
        this.assertReadyForTransportCall();
        return this.transport.getSelfUserInfo();
    }
    async getUsersInfo(userIDs) {
        this.assertReadyForTransportCall();
        return this.transport.getUsersInfo(userIDs);
    }
    async getFriendList() {
        this.assertReadyForTransportCall();
        return this.transport.getFriendList();
    }
    async checkFriendship(userIDs) {
        this.assertReadyForTransportCall();
        return this.transport.checkFriendship(userIDs);
    }
    async getFriendApplicationsAsRecipient(params) {
        this.assertReadyForTransportCall();
        return this.transport.getFriendApplicationsAsRecipient(params);
    }
    async getFriendApplicationsAsApplicant(params) {
        this.assertReadyForTransportCall();
        return this.transport.getFriendApplicationsAsApplicant(params);
    }
    async addFriend(toUserID, reqMsg) {
        this.assertReadyForTransportCall();
        await this.transport.addFriend(toUserID, reqMsg);
    }
    async acceptFriendApplication(fromUserID, handleMsg = '') {
        this.assertReadyForTransportCall();
        await this.transport.acceptFriendApplication(fromUserID, handleMsg);
    }
    async refuseFriendApplication(fromUserID, handleMsg = '') {
        this.assertReadyForTransportCall();
        await this.transport.refuseFriendApplication(fromUserID, handleMsg);
    }
    async getJoinedGroupList() {
        this.assertReadyForTransportCall();
        return this.transport.getJoinedGroupList();
    }
    async getGroupInfo(groupID) {
        this.assertReadyForTransportCall();
        return this.transport.getGroupInfo(groupID);
    }
    async searchGroups(groupID) {
        this.assertReadyForTransportCall();
        return this.transport.searchGroups(groupID);
    }
    async joinGroup(groupID, reqMsg) {
        this.assertReadyForTransportCall();
        await this.transport.joinGroup(groupID, reqMsg);
    }
    async getGroupApplicationsAsRecipient(params) {
        this.assertReadyForTransportCall();
        return this.transport.getGroupApplicationsAsRecipient(params);
    }
    async getGroupApplicationsAsApplicant(params) {
        this.assertReadyForTransportCall();
        return this.transport.getGroupApplicationsAsApplicant(params);
    }
    async acceptGroupApplication(groupID, fromUserID, handleMsg = '') {
        this.assertReadyForTransportCall();
        await this.transport.acceptGroupApplication(groupID, fromUserID, handleMsg);
    }
    async refuseGroupApplication(groupID, fromUserID, handleMsg = '') {
        this.assertReadyForTransportCall();
        await this.transport.refuseGroupApplication(groupID, fromUserID, handleMsg);
    }
    async getGroupMembers(params) {
        this.assertReadyForTransportCall();
        return this.transport.getGroupMembers(params);
    }
    async searchGroupMembers(params) {
        this.assertReadyForTransportCall();
        return this.transport.searchGroupMembers(params);
    }
    async getGroupOwnerAndAdmins(groupID) {
        this.assertReadyForTransportCall();
        return this.transport.getGroupOwnerAndAdmins(groupID);
    }
    async updateGroupMemberRole(params) {
        this.assertReadyForTransportCall();
        await this.transport.updateGroupMemberRole(params);
    }
    async transferGroupOwner(params) {
        this.assertReadyForTransportCall();
        await this.transport.transferGroupOwner(params);
    }
    async createGroup(params) {
        this.assertReadyForTransportCall();
        return this.transport.createGroup(params);
    }
    async inviteUsersToGroup(params) {
        this.assertReadyForTransportCall();
        await this.transport.inviteUsersToGroup(params);
    }
    async kickGroupMembers(params) {
        this.assertReadyForTransportCall();
        await this.transport.kickGroupMembers(params);
    }
    async changeGroupMute(params) {
        this.assertReadyForTransportCall();
        await this.transport.changeGroupMute(params);
    }
    async quitGroup(groupID) {
        this.assertReadyForTransportCall();
        await this.transport.quitGroup(groupID);
    }
    async dismissGroup(groupID) {
        this.assertReadyForTransportCall();
        await this.transport.dismissGroup(groupID);
    }
    async updateGroupInfo(params) {
        this.assertReadyForTransportCall();
        await this.transport.updateGroupInfo(params);
    }
    async setConversationDraft(params) {
        this.assertReadyForTransportCall();
        return this.transport.setConversationDraft(params);
    }
    async getHistory(params) {
        this.assertReadyForTransportCall();
        return this.transport.getHistory(params);
    }
    getConnectionState() {
        return this.connectionState;
    }
    getSessionState() {
        return this.sessionState;
    }
    assertNotDestroyed() {
        if (this.destroyed) {
            throw new IMError({
                code: 'CLIENT_DESTROYED',
                message: 'IMClient has been destroyed.',
                source: 'client',
            });
        }
    }
    assertInitialized() {
        if (!this.initialized) {
            throw new IMError({
                code: 'CLIENT_NOT_INITIALIZED',
                message: 'Call init() before login().',
                source: 'client',
            });
        }
    }
    assertLoginParams(params) {
        if (!params.userID.trim()) {
            throw new IMError({
                code: 'LOGIN_USER_ID_REQUIRED',
                message: 'userID is required.',
                source: 'auth',
            });
        }
        if (!params.token.trim()) {
            throw new IMError({
                code: 'LOGIN_TOKEN_REQUIRED',
                message: 'token is required.',
                source: 'auth',
            });
        }
    }
    assertReadyForTransportCall() {
        this.assertNotDestroyed();
        this.assertInitialized();
        if (!this.transport) {
            throw new IMError({
                code: 'CLIENT_TRANSPORT_MISSING',
                message: 'IMClient transport is not configured.',
                source: 'client',
            });
        }
        if (!this.sessionState.loggedIn) {
            throw new IMError({
                code: 'CLIENT_NOT_LOGGED_IN',
                message: 'Call login() before using message APIs.',
                source: 'auth',
            });
        }
    }
    bindTransportEvents() {
        if (!this.transport || this.unsubscribeTransportMessages) {
            return;
        }
        this.unsubscribeTransportMessages = this.transport.onNewMessages((messages) => {
            for (const message of messages) {
                this.eventEmitter.emit('message.received', { message });
            }
        });
    }
    setConnectionState(state) {
        const previousState = this.connectionState;
        if (previousState === state) {
            return;
        }
        this.connectionState = state;
        this.eventEmitter.emit('connection.changed', { state, previousState });
    }
    setSessionState(state) {
        const previousState = this.sessionState;
        if (previousState.userID === state.userID &&
            previousState.loggedIn === state.loggedIn) {
            return;
        }
        this.sessionState = state;
        this.eventEmitter.emit('session.changed', { state, previousState });
    }
}
export function createIMClient(config, options) {
    return new BaseIMClient(config, options);
}
//# sourceMappingURL=client.js.map