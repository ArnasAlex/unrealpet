/// <reference path="../../../typings/refs.d.ts" />
var saveFeedbackOp = require('../../../../../backend/operation/general/saveFeedbackOperation');
var mocker = require('../../../helper/operationMocker');
describe('Save feedback', function () {
    var req;
    var op;
    var mock;
    var currentUserId = mocker.OperationMocker.getId().toString();
    beforeEach(function () {
        req = {
            message: 'best app ever',
            isHappy: true
        };
        op = new saveFeedbackOp.SaveFeedbackOperation(req);
        op['expressRequest'] = {
            ip: '1.2.3.4'
        };
        spyOn(op, 'currentUserId').and.returnValue(currentUserId);
        mock = mocker.OperationMocker.mock(op);
    });
    it('saves feedback to database', function () {
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            cb();
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedDoc.message).toEqual(req.message);
            expect(savedDoc.ip).toEqual('1.2.3.4');
            expect(savedDoc.accountId.toString()).toEqual(currentUserId);
        });
    });
});
//# sourceMappingURL=saveFeedback.spec.js.map