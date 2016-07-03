/// <reference path="../../../typings/refs.d.ts" />
export class EnumService {
    petTypes: INameValue<PetType>[] = [];
    constructor(){
    }

    init(subscribeToMltRetrieve: (cb: () => void) => void){
        subscribeToMltRetrieve(() =>{
            this.initEnums();
        });
    }

    private initEnums(){
        this.initPetTypes();
    }

    private initPetTypes(){
        this.petTypes.push({value: PetType.Cat, name: window.mltId.pet_type_cat});
        this.petTypes.push({value: PetType.Dog, name: window.mltId.pet_type_dog});
        this.petTypes.push({value: PetType.Bird, name: window.mltId.pet_type_bird});
        this.petTypes.push({value: PetType.Rodent, name: window.mltId.pet_type_rodent});
        this.petTypes.push({value: PetType.Reptile, name: window.mltId.pet_type_reptile});
        this.petTypes.push({value: PetType.Horse, name: window.mltId.pet_type_horse});
        this.petTypes.push({value: PetType.Other, name: window.mltId.pet_type_other});
    }
}