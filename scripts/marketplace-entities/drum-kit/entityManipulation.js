// The current player/ lure animation is EMO
    EntityManipulationOwner = function(entityID) {
        this.entityID = entityID;
        this.onOwnerChanged = new ConnectableEvent();
        Messages.subscribe(this.getChannelName());
    }

    EntityManipulationOwner.prototype = {
        entityID: null,
        ownerSessionID: null,
        onOwnerChanged: null,
        refresh: function() {
            var settings = this.getSettings();
            if (settings !== null) {
                this.ownerSessionID = settings[EMO_SETTING_OWNER] !== undefined ? settings[EMO_SETTING_OWNER] : null;
            }
        },
        /** claim yourself as the EntityManipulationOwner **/
        claim: function() {
            if (this.ownerSessionID === MyAvatar.sessionUUID) {
                return;
            }
            this.ownerSessionID = MyAvatar.sessionUUID;
            this.updateSetting(ENTITY_MANIPULATON_OWNER_KEY, MyAvatar.sessionUUID);
            Messages.sendMessage(this.getChannelName(), JSON.stringify({type: 'claimed'}), true);
        },
        abandon: function() {
            this.updateSetting(ENTITY_MANIPULATON_OWNER_KEY, '');
            Messages.sendMessage(this.getChannelName(), JSON.stringify({type: 'abandoned'}), true);
        },
        getUserData: function() {
            var userData = Entities.getEntityProperties(this.entityID, ['userData']).userData;
            try {
                return JSON.parse(userData);
            } catch (e) {
                return {};
            }
        },
        getSettings: function() {
            var userData = this.getUserData();
            return userData[ENTITY_MANIPULATON_OWNER_KEY] !== undefined ? userData[ENTITY_MANIPULATON_OWNER_KEY] : {};
        },
        updateSettings: function(settings) {
            var userData = this.getUserData();
            userData[ENTITY_MANIPULATON_OWNER_KEY] = settings;

        },
        updateSetting: function(setting_key, setting_value) {
            var settings = this.getSettings();
            if (settings === null) {
                settings = {};
            }
            settings[setting_key] = setting_value;
            this.updateSettings(settings);
        },
        getChannelName: function() {
            return ENTITY_MANIPULATON_OWNER_KEY + '_' + this.entityID;
        },
        cleanUp: function() {
            Messages.unsubscribe(this.getChannelName());
        }
    };