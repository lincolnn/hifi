//
//  AssignmentAction.cpp
//  assignment-client/src/
//
//  Created by Seth Alves 2015-6-19
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#include "EntitySimulation.h"

#include "AssignmentAction.h"

AssignmentAction::AssignmentAction(EntityActionType type, QUuid id, EntityItemPointer ownerEntity) :
    _id(id),
    _type(type),
    _data(QByteArray()),
    _active(false),
    _ownerEntity(ownerEntity) {
}

AssignmentAction::~AssignmentAction() {
}

void AssignmentAction::removeFromSimulation(EntitySimulation* simulation) const {
    simulation->removeAction(_id);
}

QByteArray AssignmentAction::serialize() const {
    return _data;
}

void AssignmentAction::deserialize(QByteArray serializedArguments) {
    _data = serializedArguments;
}

bool AssignmentAction::updateArguments(QVariantMap arguments) {
    qDebug() << "UNEXPECTED -- AssignmentAction::updateArguments called in assignment-client.";
    return false;
}

QVariantMap AssignmentAction::getArguments() {
    qDebug() << "UNEXPECTED -- AssignmentAction::getArguments called in assignment-client.";
    return QVariantMap();
}

glm::vec3 AssignmentAction::getPosition() {
    qDebug() << "UNEXPECTED -- AssignmentAction::getPosition called in assignment-client.";
    return glm::vec3(0.0f);
}

void AssignmentAction::setPosition(glm::vec3 position) {
    qDebug() << "UNEXPECTED -- AssignmentAction::setPosition called in assignment-client.";
}

glm::quat AssignmentAction::getRotation() {
    qDebug() << "UNEXPECTED -- AssignmentAction::getRotation called in assignment-client.";
    return glm::quat();
}

void AssignmentAction::setRotation(glm::quat rotation) {
    qDebug() << "UNEXPECTED -- AssignmentAction::setRotation called in assignment-client.";
}

glm::vec3 AssignmentAction::getLinearVelocity() {
    qDebug() << "UNEXPECTED -- AssignmentAction::getLinearVelocity called in assignment-client.";
    return glm::vec3(0.0f);
}

void AssignmentAction::setLinearVelocity(glm::vec3 linearVelocity) {
    qDebug() << "UNEXPECTED -- AssignmentAction::setLinearVelocity called in assignment-client.";
}

glm::vec3 AssignmentAction::getAngularVelocity() {
    qDebug() << "UNEXPECTED -- AssignmentAction::getAngularVelocity called in assignment-client.";
    return glm::vec3(0.0f);
}

void AssignmentAction::setAngularVelocity(glm::vec3 angularVelocity) {
    qDebug() << "UNEXPECTED -- AssignmentAction::setAngularVelocity called in assignment-client.";
}
