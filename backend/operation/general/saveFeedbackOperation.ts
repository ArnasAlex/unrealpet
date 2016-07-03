/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import express = require('express');
import feedbackEntity = require('../../entities/feedbackEntity');

export class SaveFeedbackOperation extends operation.Operation {
    protected request: ISaveFeedbackRequest;
    private cb: (response: ISaveFeedbackResponse) => void;

    public execute(cb: (response: ISaveFeedbackResponse) => void) {
        this.cb = cb;
        this.async.waterfall([
                this.map,
                this.saveFeedback
            ],
            this.respond);
    }

    private map = (next) => {
        var feedback = new feedbackEntity.FeedbackEntity();
        feedback.message = this.request.message;
        feedback.isHappy = this.request.isHappy;
        feedback.createdOn = new Date();
        feedback.ip = this.expressRequest.ip;
        feedback.accountId = this.getObjectId(this.currentUserId());

        next(null, feedback);
    };

    private saveFeedback = (feedback: feedbackEntity.FeedbackEntity, next) => {
        this.saveNonAuditable(feedbackEntity.CollectionName, feedback, next);
    };

    private respond = (err) => {
        var response: ISaveFeedbackResponse = {};
        if (err) response.error = err;
        this.cb(response);
    }
}