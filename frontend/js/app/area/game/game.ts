/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../core/services/services');
import router = require('plugins/router');
import routes = require('../../routes');
import _ = require('lodash');

class Game {
    voteGameOptions: Components.IVoteGameOptions;
    player = new Player();
    leaderBoard = new LeaderBoard();
    isAuthenticated = services.currentAccount.isAuthenticated;
    fightControlOptions: IGameFightsOptions;

    constructor() {
        this.init();
    }

    private init() {
        this.player.get();
        this.leaderBoard.get();
        this.voteGameOptions = {
            showPlayButton: false,
            energyChangedCb: (energy: number) => { this.player.energy(energy); },
            refreshEnergy: null // will be filled from vote game
        };
    }

    activate(petId: string) {
        this.fightControlOptions = {
            energy: this.player.energy,
            maxEnergy: this.player.maxEnergy,
            gameOverCallback: () => {
                this.player.get();
                this.voteGameOptions.refreshEnergy();
            },
            playerPicture: this.player.picture
        };
    }

    deactivate(){
    }

    sectionButtonClick = (model, evt) => {
        var button = window.getTarget(evt).closest('button');
        var elId = button.data('scroll');
        var el = $('#' + elId);
        services.ui.scrollTo(el);
    }
}

export = Game;

class Player {
    uploadOptions: Components.IUploadButtonComponentOptions;
    picture = ko.observable('');
    points = ko.observable(0);
    fights = ko.observable(0);
    wins = ko.observable(0);
    defeats = ko.observable(0);
    place = ko.observable(0);
    totalPlayers = ko.observable(0);
    status = ko.observable(PlayerStatus.NotPlaying);
    isRegistered = ko.observable(false);
    petTypeCss = ko.observable('');
    energy = ko.observable(0);
    maxEnergy = 20;
    hasGift = ko.observable(false);

    playerBackgroundImage: KnockoutComputed<string>;
    statusText: KnockoutComputed<string>;
    playButtonText: KnockoutComputed<string>;
    playButtonIcon: KnockoutComputed<string>;

    constructor(){
        this.init();
    }

    private init() {
        this.uploadOptions = {
            uploadUrl: routes.game.uploadPlayerPicture,
            data: null,
            btnText: ko.computed(() => {
                return !this.picture()
                    ? window.mltId.game_upload_picture
                    : window.mltId.game_change_picture;
            }),
            uploadCb: this.uploadPictureCb,
            fileType: UploadFileType.Picture
        };

        this.playerBackgroundImage = ko.computed(() => {
            return 'url(' + this.picture() + ')';
        });

        this.statusText = ko.computed(() => {
            var statuses = {};
            statuses[PlayerStatus.NotPlaying] = window.mltId.game_player_status_not_playing;
            statuses[PlayerStatus.Playing] = window.mltId.game_player_status_playing;
            statuses[PlayerStatus.Stopped] = window.mltId.game_player_status_stopped;

            return statuses[this.status()];
        });

        this.playButtonText = ko.computed(() => {
            return this.status() === PlayerStatus.Playing
                ? window.mltId.game_stop_game
                : window.mltId.game_join_game;
        });

        this.playButtonIcon = ko.computed(() => {
            return this.status() === PlayerStatus.Playing
                ? 'fa-pause'
                : 'fa-play'
        });
    }

    get = () => {
        services.server.get(routes.game.getPlayerInfo, {}).then((response: IGetPlayerInfoResponse) =>{
            this.fights(response.fights | 0);
            this.points(response.points | 0);
            this.wins(response.wins | 0);
            this.defeats(response.defeats | 0);
            this.isRegistered(response.isRegistered);
            this.status(response.status | PlayerStatus.NotPlaying);
            this.picture(response.pictureUrl ? response.pictureUrl : '');
            this.totalPlayers(response.totalPlayers | 0);
            this.place(response.place | 0);
            this.hasGift(response.hasGift);
            if (!this.isRegistered()){
                this.setPetType();
            }
        });
    };

    changePlayerStatus = () => {
        var newStatus = this.getNewStatus();
        var req: IChangePlayerStatusRequest = {
            status: newStatus
        };

        services.server.post(routes.game.changePlayerStatus, req).then(() => {
           this.status(newStatus);
        });
    };

    openGift = (model, evt) => {
        services.server.post(routes.game.openGift, {}).then((response) => {
            this.openGiftCb(response, evt)
        });
    };

    private openGiftCb = (response: IOpenGiftResponse, evt: Event) => {
        var $container = window.getTarget(evt);
        if (!$container.is('div')){
            $container = $container.closest('div');
        }

        var text = '+' + response.points;
        var $el = $('<span></span>');
        $el.text(text);
        $el.hide();
        $el.appendTo($container);

        var $gamePoints = $container.closest('.panel').find('#game-points');

        $container.find('i').velocity('fadeOut', { complete: () => {
            $el.velocity('fadeIn', {complete: () => {
                $container.velocity('fadeOut', {duration: 1500, delay: 500, complete: () => {
                    $gamePoints
                        .velocity({backgroundColor: '#663399'}, {duration: 500})
                        .velocity('reverse', {delay: 1000, begin: () => {
                            this.points(this.points() + response.points);
                        }, complete: () => {
                            $gamePoints.css('background-color', '');
                        }});
                }});
            }});
        }});
    };

    private getNewStatus(){
        var statusWorkflow = {};
        statusWorkflow[PlayerStatus.NotPlaying] = PlayerStatus.Playing;
        statusWorkflow[PlayerStatus.Playing] = PlayerStatus.Stopped;
        statusWorkflow[PlayerStatus.Stopped] = PlayerStatus.Playing;

        var newStatus = statusWorkflow[this.status()];
        return newStatus;
    }

    private uploadPictureCb = (response: IUploadPlayerPictureResponse) => {
        if (response.error){
            return;
        }

        if (this.isRegistered()){
            this.picture(response.pictureUrl);
            return;
        }

        this.get();
    };

    private setPetType(){
        var css = services.ui.getClassForPetType(PetType.Other);
        this.petTypeCss(css);
    }
}

class LeaderBoard {
    list = ko.observableArray([]);
    totalCount = 0;
    hasMore = ko.observable(true);
    pageSize = 10;

    constructor() {
    }

    get(){
        var request: IGetGameLeadersRequest = {
            skip: this.list().length,
            take: this.pageSize
        };

        services.server.get(routes.game.getGameLeaders, request).then(this.getCb);
    }

    leaderClick = (leader: IGameLeader, evt) => {
        services.nav.goToUrl('#posts/' + leader.accountId);
    };

    moreClick = () => {
        if (!this.hasMore()){
            return;
        }

        this.get();
    };

    refresh = () => {
        this.list([]);
        this.get();
    };

    private getCb = (response: IGetGameLeadersResponse) => {
        if (response.totalCount){
            this.totalCount = response.totalCount;
        }

        var retrievedList = _.map(response.list, x => new GameLeader(x));
        var list = this.list();
        var result = list.concat(retrievedList);
        this.list(result);

        var hasMore = result.length < this.totalCount;
        this.hasMore(hasMore);
    }
}

class GameLeader implements IGameLeader {
    id: string;
    accountId: string;
    place: number;
    name: string;
    picture: string;
    points: number;
    type: PetType;
    petTypeClass: string;
    placeClass: string;

    constructor(leader: IGameLeader){
        for(var prop in leader){
           this[prop] = leader[prop];
        }

        if (!this.picture){
            this.picture = '';
        }
        this.petTypeClass = services.ui.getClassForPetType(leader.type);
        this.placeClass = this.getPlaceClass(this.place);
    }

    private getPlaceClass(place: number){
        if (place < 10){
            return '';
        }
        else if (place < 100){
            return 'dozen';
        }
        else if (place < 1000){
            return 'hundred';
        }
        else if (place >= 1000) {
            return 'thousand';
        }
    }
}