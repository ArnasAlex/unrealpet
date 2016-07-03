/// <reference path='./mlt.d.ts' />
/// <reference path='./enum.d.ts' />

interface IRequest {}
interface IResponse {
    error?: string;
}
interface ISearchRequest extends IRequest{
    filter?: string;
    sort?: any;
    skip: number;
    take: number;
}
interface ISearchResponse<T> extends IResponse{
    list: T[];
    totalCount?: number;
}

interface IAuthenticatedRequest extends IRequest {
    accountId?: string;
}

interface ILoginRequest extends IRequest {
    email: string;
    password: string;
}
interface ILoginResponse extends IResponse {
    accountId: string;
}

interface ISignUpRequest extends IRequest {
    email: string;
    password: string;
}
interface ISignUpResponse extends IResponse {}

interface IGetMltRequest extends IRequest {
    preferredLanguage: Language;
}
interface IGetMltResponse extends IResponse {
    language: Language;
    mlt: IMlt;
}

interface IGetCurrentUserRequest extends IRequest {}
interface IGetCurrentUserResponse extends IResponse {
    user: ICurrentUser;
}
interface ICurrentUser {
    isAuthenticated: boolean;
    email: string;
    language: Language;
    name: string;
    postCount: number;
}

interface ISaveAccountRequest extends IAuthenticatedRequest {
    name: string;
    type: PetType;
    breed: string;
    birthday: string;
    about: string;
}
interface ISaveAccountResponse extends IResponse {}

interface IUploadAccountPictureRequest extends IAuthenticatedRequest{
    expressRequest: any;
    expressResponse: any;
}
interface IUploadAccountPictureResponse extends IResponse {
    pictureUrl: string;
}

interface IGetAccountRequest extends IAuthenticatedRequest {}
interface IGetAccountResponse extends IResponse {
    name: string;
    type: PetType;
    breed: string;
    birthday: string;
    about: string;
    picture: string;
    logo: string;
}

interface IRemoveAccountPictureRequest extends IAuthenticatedRequest {
    type: AccountPictures;
}
interface IRemoveAccountPictureResponse extends IResponse {}

interface ISavePostRequest extends IAuthenticatedRequest {
    contentType: PostContentType;
    title: string;
    contentUrl: string;
}
interface ISavePostResponse extends IResponse {}

interface IGetPostsRequest extends ISearchRequest, IAuthenticatedRequest {}
interface IGetPostsResponse extends ISearchResponse<IPost> {
}
interface IPost {
    id: string;
    title: string;
    contentUrl: string;
    ownerId: string;
    ownerName: string;
    ownerLogo: string;
    ownerType: PetType;
    paws: number;
    isPawed: boolean;
    comments: number;
    unreadComments: number;
    unviewedPaws: number;
    topComment: string;
    topCommentOwnerName: string;
    favs: number;
    contentType: PostContentType;
    createdOn: string;
}

interface IUploadPostPictureRequest extends IAuthenticatedRequest{
    expressRequest: any;
    expressResponse: any;
}
interface IUploadPostPictureResponse extends IResponse {
    pictureUrl: string;
}

interface ITogglePostPawRequest extends IAuthenticatedRequest {
    postId: string;
}
interface ITogglePostPawResponse extends IResponse {
    isPawSet: boolean;
}

interface ISavePostCommentRequest extends IAuthenticatedRequest {
    text: string;
    postId: string;
    parentCommentId?: string;
}
interface ISavePostCommentResponse extends IResponse {
    comment: IComment;
}

interface IGetPostCommentsRequest extends IAuthenticatedRequest {
    postId: string;
    commentId?: string;
    skip?: number;
}
interface IGetPostCommentsResopnse extends IResponse {
    comments: Array<IComment>;
    totalCount: number;
}
interface IComment {
    id: string;
    text: string;
    ownerId: string;
    ownerName: string;
    ownerLogo: string;
    ownerType: PetType;
    date: Date;
    isPawed: boolean;
    paws: number;
    parentCommentId: string;
    replies: number;
}

interface ITogglePostCommentPawRequest extends IAuthenticatedRequest {
    postId: string;
    commentId: string;
}
interface ITogglePostCommentPawResponse extends IResponse {
    isPawSet: boolean;
}

interface IGetConnectionsRequest extends ISearchRequest {}
interface IGetConnectionsResponse extends ISearchResponse<IConnection> {}
interface IConnection {
    id: string;
    accountName: string;
    ip: string;
    action: string;
    date: Date;
}

interface IGetErrorsRequest extends ISearchRequest{}
interface IGetErrorsResponse extends ISearchResponse<IError>{}
interface IError {
    id: string;
    type: ErrorType;
    message: string;
    date: Date;
}

interface ISaveAccountSettingsRequest extends IAuthenticatedRequest {
    language: Language;
}
interface ISaveAccountSettingsResponse extends IResponse{}

interface IGetAccountSettingsRequest extends IAuthenticatedRequest {}
interface IGetAccountSettingsResponse extends IResponse {
    language: Language;
    email: string;
}

interface IEditPictureRequest extends IAuthenticatedRequest {
    url: string;
    action: PictureEditAction;
}
interface IEditPictureResponse extends IResponse{}

interface IGetAccountsRequest extends ISearchRequest{}
interface IGetAccountsResponse extends ISearchResponse<IAccount> {}
interface IAccount {
    id: string;
    name: string;
    email: string;
    createdOn: Date;
    lastActivityOn: Date;
    loginProvider: LoginProvider;
    master: string;
}

interface IGetPetPostsRequest extends ISearchRequest, IAuthenticatedRequest {
    id?: string;
}
interface IGetPetPostsResponse extends ISearchResponse<IPost> {}

interface IUploadPostVideoRequest extends IAuthenticatedRequest{
    expressRequest: any;
    expressResponse: any;
}
interface IUploadPostVideoResponse extends IResponse {
    videoUrl: string;
}

interface IGetPetPostDetailsRequest extends IAuthenticatedRequest {
    id?: string;
}
interface IGetPetPostDetailsResponse extends IResponse {
    details: IPetPostDetails;
}
interface IPetPostDetails {
    id: string;
    name: string;
    upps: number;
    paws: number;
    comments: number;
    posts: number;
    mainPictureUrl: string;
    gamePictureUrl: string;
    logoUrl: string;
    about: string;
    type: PetType;
}

interface IGetPostRequest extends IAuthenticatedRequest {
    id: string;
}
interface IGetPostResponse extends IResponse {
    post: IEditablePost;
}
interface IEditablePost extends IPost{
    canEdit: boolean;
}

interface IEditPostRequest extends IRequest {
    id: string;
    title?: string;
    isRemoval: boolean;
}
interface IEditPostResponse extends IResponse {}

interface IGetRecentPostActivitiesRequest extends IAuthenticatedRequest {
}
interface IGetRecentPostActivitiesResponse extends IResponse {
    list: IRecentActivity[];
}
interface IRecentActivity {
    relatedId: string;
    title: string;
    message: string;
    type: ActivityType;
}

interface IClearRecentPostActivitiesRequest extends IAuthenticatedRequest {
}
interface IClearRecentPostActivitiesResponse extends IResponse {
}

interface IGetUpdatesRequest extends IAuthenticatedRequest {
}
interface IGetUpdatesResponse extends IResponse {
    hasActivities: boolean;
    version: string;
}

interface IUploadCoverPictureRequest extends IRequest{}
interface IUploadCoverPictureResponse extends IResponse{}

interface ISaveFeedbackRequest extends IRequest {
    message: string;
    isHappy: boolean;
}
interface ISaveFeedbackResponse extends IResponse {}

interface IGetFeedbacksRequest extends ISearchRequest {}
interface IGetFeedbacksResponse extends ISearchResponse<IFeedback> {}
interface IFeedback {
    id: string;
    ip: string;
    name: string;
    accountId: string;
    createdOn: string;
    isHappy: boolean;
    message: string;
}

interface IUploadPlayerPictureRequest extends IRequest{}
interface IUploadPlayerPictureResponse extends IResponse{
    pictureUrl: string;
}

interface IGetPlayerInfoRequest extends IRequest{}
interface IGetPlayerInfoResponse extends IResponse{
    pictureUrl: string;
    fights: number;
    points: number;
    wins: number;
    defeats: number;
    totalPlayers: number;
    place: number;
    status: PlayerStatus;
    isRegistered: boolean;
    energy: number;
    hasGift: boolean;
}

interface IChangePlayerStatusRequest extends IRequest{
    status: PlayerStatus;
}
interface IChangePlayerStatusResponse extends IResponse{}

interface IGetGameFightRequest extends IRequest{}
interface IGetGameFightResponse extends IResponse{
    id: string;
    players: IGameFightPlayer[];
}
interface IGameFightPlayer {
    id: string;
    picture: string;
    place: number;
}

interface IChooseGameWinnerRequest {
    fightId: string;
    playerId: string;
}
interface IChooseGameWinnerResponse extends IGetGameFightResponse {}

interface IGetGameLeadersRequest extends ISearchRequest{}
interface IGetGameLeadersResponse extends ISearchResponse<IGameLeader>{}
interface IGameLeader {
    id: string;
    accountId: string;
    place: number;
    name: string;
    picture: string;
    points: number;
    type: PetType;
}

interface IGetGameFightsRequest extends ISearchRequest {}
interface IGetGameFightsResponse extends ISearchResponse<IGameFight>{}
interface IGameFight {
    id: string;
    opponentPlayerId: string;
    opponentAccountId: string;
    opponentName: string;
    opponentPicture: string;
    opponentPlace: number;
    isWin: boolean;
    points: number;
    date: string;
    status: FightStatus;
}

interface IUpdateFightRequest extends IRequest {
    id: string;
    skill: VoteResultControlSkill;
    guessingSelf: boolean;
}
interface IUpdateFightResponse extends IResponse{
    energy: number;
    originalPoints: IFightPoints;
    modifiedPoints: IFightPoints;
    isWinner: boolean;
}
interface IFightPoints {
    player: number;
    opponent: number;
}

interface IGetPlayerEnergyRequest extends IRequest {}
interface IGetPlayerEnergyResponse extends IResponse {
    energy: number;
    availableEnergy: number;
}

interface IOpenGiftRequest extends IRequest {}
interface IOpenGiftResponse extends IResponse {
    points: number;
}