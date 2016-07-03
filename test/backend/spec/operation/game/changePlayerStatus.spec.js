/// <reference path="../../../typings/refs.d.ts" />
var changePlayerStatusOp = require('../../../../../backend/operation/game/changePlayerStatusOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Change player status', function () {
    var req;
    var op;
    var mock;
    var player;
    var currentUserId = mocker.OperationMocker.getId();
    var savedDoc;
    beforeEach(function () {
        req = {
            status: 1
        };
        op = new changePlayerStatusOp.ChangePlayerStatusOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        player.status = 0;
        mock.collectionMock.findOne = function (query, cb) {
            cb(null, player);
        };
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            cb(null);
        };
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
    });
    it('changes player status in database', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedDoc.status).toEqual(1);
            done();
        });
    });
});
//# sourceMappingURL=changePlayerStatus.spec.js.map