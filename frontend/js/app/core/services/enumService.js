define(["require", "exports"], function (require, exports) {
    var EnumService = (function () {
        function EnumService() {
            this.petTypes = [];
        }
        EnumService.prototype.init = function (subscribeToMltRetrieve) {
            var _this = this;
            subscribeToMltRetrieve(function () {
                _this.initEnums();
            });
        };
        EnumService.prototype.initEnums = function () {
            this.initPetTypes();
        };
        EnumService.prototype.initPetTypes = function () {
            this.petTypes.push({ value: 2 /* Cat */, name: window.mltId.pet_type_cat });
            this.petTypes.push({ value: 3 /* Dog */, name: window.mltId.pet_type_dog });
            this.petTypes.push({ value: 4 /* Bird */, name: window.mltId.pet_type_bird });
            this.petTypes.push({ value: 5 /* Rodent */, name: window.mltId.pet_type_rodent });
            this.petTypes.push({ value: 6 /* Reptile */, name: window.mltId.pet_type_reptile });
            this.petTypes.push({ value: 7 /* Horse */, name: window.mltId.pet_type_horse });
            this.petTypes.push({ value: 1 /* Other */, name: window.mltId.pet_type_other });
        };
        return EnumService;
    })();
    exports.EnumService = EnumService;
});
//# sourceMappingURL=enumService.js.map