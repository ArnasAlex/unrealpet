/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../services/services');
import routes = require('../../../routes');
import _ = require('lodash');
import component = require('../base/component');

export class VoteGame extends component.Component {
    name = 'vote-game';
    createViewModel = () => { return new VoteGameModel(); };
    template = { require: this.getBaseTemplatePath() + '/voteGame/voteGame.html' }
}

class VoteGameModel implements Components.IComponentViewModel {
    player1 = new Player();
    player2 = new Player();
    fightId: string;
    fightExist = ko.observable(false);
    isPlayButtonVisible = ko.observable(false);
    energy = ko.observable(0);
    availableEnergy = ko.observable(0);
    energyPercent: KnockoutComputed<number>;
    availableEnergyPercent: KnockoutComputed<number>;
    energyText: KnockoutComputed<string>;
    maxEnergy = 20;

    private options: Components.IVoteGameOptions;

    constructor(){
        this.energyPercent = ko.computed(() => {
            return Math.floor(this.energy() / this.maxEnergy *  100);
        });

        this.availableEnergyPercent = ko.computed(() => {
            return Math.floor(this.availableEnergy() / this.maxEnergy *  100);
        });

        this.energyText = ko.computed(() => {
            return this.energy() + ' / ' + this.availableEnergy();
        });
    }

    init(options: Components.IVoteGameOptions, element: JQuery) {
        this.options = options;

        this.isPlayButtonVisible(options.showPlayButton);
        services.currentAccount.isAuthenticated.subscribe(() => {
            this.getFight();
        });

        this.getFight();
        this.getEnergy();
        this.options.refreshEnergy = this.getEnergy;
    }

    getFight() {
        services.server.get(routes.game.getGameFight, {}).then(this.getFightCb);
    }

    getEnergy = () => {
        if (services.currentAccount.isAuthenticated()){
            services.server.get(routes.game.getPlayerEnergy, {}).then(this.getEnergyCb);
        }
        else{
            this.energy(0);
            this.availableEnergy(this.maxEnergy);
        }
    };

    chooseWinner = (player: Player, evt: JQueryEventObject) => {
        var picture = window.getTarget(evt);
        var container = picture.closest('.panel-body');
        var pictures = container.find('.player .image');

        var covers = _.map(pictures, pic => {
            var cover = services.ui.cloneElement($(pic));
            cover.css({
                'opacity': 1,
                'z-index': 19,
                'background-color': '#454545',
                'background-image': '',
                'display': 'none'
            });

            var logoHtml = '<div class="logo"></div>';
            var logo = $(logoHtml);
            logo.appendTo(cover);

            return cover;
        });

        var clone = services.ui.cloneElement(picture);

        var newSize = container.outerWidth() - 4;
        if (newSize > picture.height() * 2){
            newSize = picture.height() * 2;
        }

        var toLeft = (newSize - picture.width()) / 2;
        var top = (container.outerHeight() - newSize) / 2 - picture.parent().position().top;

        var animationProperties = {
            top: '+=' + top,
            width: newSize,
            height: newSize,
            left: '-=' + toLeft
        };

        var checkHtml =
            '<div class="winner">' +
            '<div><i class="big-icon fa fa-check"></i></div>' +
            '<div class="place"><i class="fa fa-trophy place-icon"></i>'+ player.place +'</div>' +
            '</div>';

        var energyIncrementHtml = '<div class="energy-increment"><i class="fa fa-bolt"></i></div>';
        var fadeInDuration = 300;

        var energyBar = $('.vote .energy .bar');

        clone
            .velocity(animationProperties,
            {
                duration: fadeInDuration,
                complete: () => {
                    var check = $(checkHtml);
                    check.appendTo(clone);
                    check.show();

                    var energyIncrement = $(energyIncrementHtml);
                    energyIncrement.appendTo(clone);
                    var energyIncrementDistance = energyBar.offset().top - energyIncrement.offset().top;

                    energyIncrement.velocity(
                        {
                            top: '+=' + energyIncrementDistance
                        },
                        {
                            duration: 1200,
                            complete: () => {
                                energyIncrement.remove();
                                this.incrementEnergy();
                            }
                        });

                    var executedCb = false;
                    _.each(covers, cover => {
                        cover.show();
                    });

                    this.winnerChosen(player.id);
                }
            })
            .velocity('fadeOut',
            {
                duration: 700,
                delay: 1500,
                complete: () =>{
                    clone.remove();
                    var vs = picture.closest('.panel-body').find('.vs');
                    this.animateVs(vs, covers);
                }
            });
    };

    private incrementEnergy = () => {
        if (this.energy() >= this.availableEnergy()){
            return;
        }

        this.energy(this.energy() + 1);
        if (this.options.energyChangedCb){
            this.options.energyChangedCb(this.energy());
        }
    };

    private animateVs = (vs: JQuery, covers: JQuery[]) => {
        var fadeInDuration = 500;
        vs
            .velocity({backgroundColor: '#000000'}, {duration: fadeInDuration, complete: () => {
                _.each(covers, cover => {
                    cover.velocity({'opacity': 0},
                        {
                            duration: fadeInDuration,
                            complete: () => { cover.remove(); }});
                });
            }})
            .velocity({ backgroundColor: '#ffffff' }, {delay: 200});
    };

    private winnerChosen(playerId: string){
        var req: IChooseGameWinnerRequest = {
            fightId: this.fightId,
            playerId: playerId
        };
        services.server.post(routes.game.chooseGameWinner, req).then(this.getFightCb);
    }

    private getFightCb = (response: IGetGameFightResponse) => {
        this.fightId = response.id;
        this.fightExist(!!this.fightId);

        if (this.fightExist()){
            this.player1.update(response.players[0]);
            this.player2.update(response.players[1]);
        }
    };

    private getEnergyCb = (response: IGetPlayerEnergyResponse) => {
        this.energy(response.energy);
        this.availableEnergy(response.availableEnergy);
        if (this.options.energyChangedCb){
            this.options.energyChangedCb(this.energy());
        }
    };
}

class Player {
    id: string;
    place: number;
    picture = ko.observable('');

    update(dto: IGameFightPlayer){
        this.id = dto.id;
        this.place = dto.place;

        this.picture(dto.picture);
    }
}