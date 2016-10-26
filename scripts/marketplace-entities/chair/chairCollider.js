//
// Created by Triplelexx on 16/05/26
// Copyright 2016 High Fidelity, Inc.
//
// Creates an entity that can be sat upon
//
// Sitting animations adapted by Triplelexx from version obtained from Mixamo
// Links provided to copies of original animations created by High Fidelity, Inc
// This is due to issues requiring use of overrideRoleAnimation to chain animations and not knowing a better way
// to reference them cross-platform.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    print("running collider!")
    var _this;

    function ChairCollider() {
        _this = this;
        return;
    }

    ChairCollider.prototype = {
        parentID: null,
        preload: function(entityId) {
            this.entityId = entityId;
            this.parentID = Entities.getEntityProperties(this.entityId, ['parentID']).parentID;
        },
        enterEntity: function(entityId) {
            Entities.callEntityMethod(this.parentID, 'maybeSit');
        },
        leaveEntity: function(entityID) {
            Entities.callEntityMethod(this.parentID, 'standUp');
        }
    }

    // entity scripts always need to return a newly constructed object of our type
    return new ChairCollider();
});