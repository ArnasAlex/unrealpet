/// <reference path="../../typings/refs.d.ts" />
import mongodb = require('mongodb');
import async = require('async');
import errorLogEntity = require('./../../entities/errorLogEntity');
import db = require('../../core/database');
import logger = require('../../core/logger');
import multiLang = require('../../core/multilang/mltProvider');
import entity = require('../../entities/base/entity');
import lodash = require('lodash');
import express = require('express');
import accHelper = require('../login/accountHelper');

export class Operation {
    protected db: mongodb.Db;
    protected async = async;
    protected request: IRequest;
    protected mlt: IMlt;
    protected _ = lodash;
    private static objectIdRegex = new RegExp("^[0-9a-fA-F]{24}$");
    protected currentUser: accHelper.Account;
    protected expressRequest: express.Request;
    protected expressResponse: express.Response;

    constructor(request: IRequest, req?: express.Request, res?: express.Response) {
        var database = db.Database.getInstance();
        this.db = database.db;
        this.request = request;
        this.mlt = multiLang.MultilangProvider.multilangIds;

        if (req){
            this.extractRequest(req);
            this.expressRequest = req;
            this.expressResponse = res;
        }
    }

    private extractRequest(req: express.Request){
        var payload;
        if (req.method === 'POST'){
            payload = req.body;
        }
        else{
            payload = req.query;
        }

        if (req.user && req.user.id){
            payload.accountId = req.user.id;
        }

        this.request = payload;
        this.currentUser = req.user;
    }

    public execute(responeCallback: (response: IResponse) => void) {
        throw Error("Override execute() method.");
    }

    public getId(): mongodb.ObjectID {
        return new mongodb.ObjectID();
    }

    public getObjectId(id: string): mongodb.ObjectID {
        if (Operation.objectIdRegex.test(id)){
            return new mongodb.ObjectID(id);
        }

        return null;
    }

    public error(message: string) {
        throw Error(message);
    }

    public logError(message: string, request?: any, type?: ErrorType){
        var userId = this.currentUserId();
        if (!userId){
            userId = 'unauthenticated';
        }

        message += ' user: ' + userId;
        if (request){
            message += ' request: ' + JSON.stringify(request);
        }

        logger.Logger.logError(message, type);
    }

    public logDbError(message: string, collectionName: string = ''){
        var result = 'Error on mongo db';
        if (collectionName){
            result += ' (' + collectionName + ')';
        }
        result += ': ' + message;

        logger.Logger.logError(result);
    }

    public defaultErrorMsg(): string{
        return this.mlt.server_error_default;
    }

    public mustFindOne(collection: string, query: any, cb: (err: string, res: any) => void) {
        this.db.collection(collection).findOne(query, (err: string, res) => {
            if (err) {
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }
            else if (!res){
                var msg = 'Failed to get record from database which must exist. Query: ' + JSON.stringify(query);
                this.logDbError(msg, collection);
                err = this.defaultErrorMsg();
            }

            cb(err, res);
        });
    }

    public findOne(collection: string, query: any, cb: (err: string, res: any) => void) {
        this.db.collection(collection).findOne(query, (err: string, res) => {
            if (err) {
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }

            cb(err, res);
        });
    }

    public remove(collection: string, query: any, cb: (err: string, res: any) => void) {
        this.db.collection(collection).remove(query, (err: string, res) => {
            if (err) {
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }

            cb(err, res);
        });
    }

    public save(collection: string, obj: entity.IAuditable, cb: (err: string, res: any) => void){
        if (!obj._id){
            obj._id = this.getId();
        }

        if (!obj.createdOn){
            obj.createdOn = new Date();
        }

        obj.updatedOn = new Date();
        this.saveNonAuditable(collection, obj, cb);
    }

    public saveNonAuditable(collection: string, obj: entity.IEntity, cb: (err: string, res: any) => void){
        this.db.collection(collection).save(obj, (err, res) => {
            if (err) {
                this.logDbError('Error on saving ' + collection + ' entity: '+ err);
                err = this.defaultErrorMsg();
            }
            cb(err, obj);
        });
    }

    public delete(collection: string, query: any, cb: (err: string, res: any) => void){
        this.db.collection(collection).remove(query, (err: any, res) => {
            if (err) {
                this.logDbError('Error on removing ' + collection + ' entity: '+ err);
                err = this.defaultErrorMsg();
            }
            cb(err, res);
        });
    }

    public update(collection: string, query: any, update: any, cb: (err: string, res: any) => void){
        this.db.collection(collection).update(query, update, {multi: true}, (err: any, res) => {
            if (err) {
                this.logDbError('Error on updating ' + collection + ' query: '+ JSON.stringify(query)
                    + ', update: ' + JSON.stringify(update) + ' err: ' + err);
                err = this.defaultErrorMsg();
            }
            cb(err, res);
        });
    }

    public getNumberFromGetRequest(obj: any){
        return obj ? parseInt(obj) : 0;
    }

    public parseSearchRequest(req: ISearchRequest){
        req.skip = this.getNumberFromGetRequest(req.skip);
        req.take = this.getNumberFromGetRequest(req.take);
    }

    isAdmin(): boolean{
        return this.currentUser && this.currentUser.roles && this.currentUser.roles.indexOf(Role.Admin) !== -1;
    }

    currentUserId(): string {
        return this.currentUser ? this.currentUser.id : null;
    }

    currentUserObjectId(): mongodb.ObjectID {
        var id = this.currentUserId();
        return id ? this.getObjectId(id) : null;
    }

    currentUserIp(): string {
        return this.expressRequest.ip;
    }

    getRandomBetween(min: number, max: number){
        var rand = min + Math.floor(Math.random() * (max - min + 1));
        return rand;
    }
}