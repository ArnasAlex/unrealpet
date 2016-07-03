/// <reference path="../../../typings/refs.d.ts" />
import saveFeedbackOp = require('../../../../../backend/operation/general/saveFeedbackOperation');
import mocker = require('../../../helper/operationMocker');
import feedbackEntity = require('../../../../../backend/entities/feedbackEntity');

describe('Save feedback',() => {
    var req: ISaveFeedbackRequest;
    var op: saveFeedbackOp.SaveFeedbackOperation;
    var mock: mocker.IMockedOperation;
    var currentUserId = mocker.OperationMocker.getId().toString();

    beforeEach(() => {
        req = {
            message: 'best app ever',
            isHappy: true
        };
        op = new saveFeedbackOp.SaveFeedbackOperation(req);
        op['expressRequest'] = <any>{
            ip: '1.2.3.4'
        };
        spyOn(op, 'currentUserId').and.returnValue(currentUserId);
        mock = mocker.OperationMocker.mock(op);
    });

    it('saves feedback to database', () => {
        var savedDoc: feedbackEntity.FeedbackEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            cb();
        };

        op.execute((response: ISaveFeedbackResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedDoc.message).toEqual(req.message);
            expect(savedDoc.ip).toEqual('1.2.3.4');
            expect(savedDoc.accountId.toString()).toEqual(currentUserId);
        });
    });
});