declare const enum PetType {
    Other = 1,
    Cat = 2,
    Dog = 3,
    Bird = 4,
    Rodent = 5,
    Reptile = 6,
    Horse = 7
}

declare const enum PostContentType {
    UploadedPicture = 1,
    UrlPicture = 2,
    Video = 3
}

declare const enum AccountPictures {
    Main = 1,
    Logo = 2
}

declare const enum ErrorType {
    Warning = 1,
    Normal = 2,
    Critical = 3
}

declare const enum Language {
    NotDefined = 0,
    English = 1,
    Lithuanian = 2
}

declare const enum PictureEditAction {
    RotateLeft = 1,
    RotateRight = 2
}

declare const enum ErrorCodes {
    ServerError = 1,
    NotFound = 2
}

declare const enum LoginProvider {
    Email = 0,
    Google = 1,
    Facebook = 2
}

declare const enum PlayerStatus {
    NotPlaying = 0,
    Playing = 1,
    Stopped = 2
}

declare const enum SkillType {
    Neutral = 0,
    Benefit = 1,
    Damage = 2
}

declare const enum FightStatus {
    Outdated = 0,
    Initial = 1,
    Playing = 2,
    Over = 3
}

declare const enum VoteResultControlSkill {
    TurnAround = 0,
    Bomb = 1,
    GuessWinner = 2,
    DoublePoints = 3
}

declare const enum ActivityType {
    MyPostComment = 0,
    OthersPostComment = 1,
    MyPostPaw = 2
}