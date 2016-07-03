/// <reference path="../../typings/refs.d.ts" />
import iexpress = require('express');

export class Controller {
    getConfig(): IControllerConfig {
        throw Error('Implement getConfig() on controller');
    }

    getPayload(req: iexpress.Request){
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

        return payload;
    }
}