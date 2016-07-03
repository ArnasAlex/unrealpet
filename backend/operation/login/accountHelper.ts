/// <reference path="../../typings/refs.d.ts" />
import accountEntity = require('../../entities/accountEntity');
import express = require('express');
import mltProvider = require('../../core/multilang/mltProvider');

export class Account {
    id: string;
    name: string;
    roles: Role[];
}

export class Helper {
    private static defaultNamePrefix = 'UnrealPet';
    static getProviderName(provider:LoginProvider) {
        switch (provider) {
            case LoginProvider.Google:
                return 'google';

            case LoginProvider.Facebook:
                return 'facebook';
        }

        return 'unknown';
    }

    static getLoginProvider(account: accountEntity.AccountEntity){
        if (account.google){
            return LoginProvider.Google;
        }

        if (account.facebook){
            return LoginProvider.Facebook;
        }

        return LoginProvider.Email;
    }

    static map(entity: accountEntity.AccountEntity) {
        var account: Account = {
            id: entity._id.toString(),
            name: entity.name,
            roles: entity.roles
        };

        return account;
    }

    static setDefaultValuesForNewAccount(entity: accountEntity.AccountEntity){
        entity.name = Helper.defaultNamePrefix + Math.floor((Math.random() * 10000));
        entity.type = PetType.Other;
    }

    static setLanguageForNewAccount(entity: accountEntity.AccountEntity, request: express.Request){
        var lang = mltProvider.MultilangProvider.getLangFromAcceptedHeaders(request.headers['accept-language']);
        if (lang === Language.NotDefined){
            lang = mltProvider.MultilangProvider.getDefaultLanguage();
        }

        if (!entity.settings){
            entity.settings = {language: Language.NotDefined};
        }
        entity.settings.language = lang;
    }
}

export interface ISignUpProviderProfile {
    id: string;
    displayName: string;
    emails: ISignUpProviderProfileEmail[];
}

export interface ISignUpProviderProfileEmail {
    value: string;
}