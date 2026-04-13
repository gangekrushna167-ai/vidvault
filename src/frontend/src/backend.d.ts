import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: VideoId;
    title: string;
    thumbnail?: ExternalBlob;
    collectionId?: CollectionId;
    owner: UserId;
    blob: ExternalBlob;
    createdAt: Timestamp;
    tags: Array<string>;
    description: string;
    fileSize: bigint;
    filename: string;
}
export type ShareScope = {
    __kind__: "tag";
    tag: string;
} | {
    __kind__: "collection";
    collection: CollectionId;
} | {
    __kind__: "library";
    library: null;
};
export type Timestamp = bigint;
export interface VideoFilter {
    sortField: SortField;
    dateTo?: Timestamp;
    collectionId?: CollectionId;
    sortOrder: SortOrder;
    tags?: Array<string>;
    searchTerm?: string;
    dateFrom?: Timestamp;
}
export interface UpdateVideoRequest {
    id: VideoId;
    title: string;
    collectionId?: CollectionId;
    tags?: Array<string>;
    description: string;
}
export type DeleteCollectionStrategy = {
    __kind__: "moveToCollection";
    moveToCollection: CollectionId;
} | {
    __kind__: "deleteVideos";
    deleteVideos: null;
} | {
    __kind__: "moveToUncategorized";
    moveToUncategorized: null;
};
export interface BatchVideoActionRequest {
    action: BatchAction;
    videoIds: Array<VideoId>;
}
export type BatchAction = {
    __kind__: "moveToCollection";
    moveToCollection: CollectionId | null;
} | {
    __kind__: "delete";
    delete: null;
} | {
    __kind__: "addTags";
    addTags: Array<string>;
} | {
    __kind__: "removeTags";
    removeTags: Array<string>;
};
export interface AddVideoRequest {
    title: string;
    thumbnail?: ExternalBlob;
    collectionId?: CollectionId;
    blob: ExternalBlob;
    tags?: Array<string>;
    description: string;
    fileSize: bigint;
    filename: string;
}
export type UserId = Principal;
export type ShareLinkId = string;
export interface Collection {
    id: CollectionId;
    title: string;
    owner: UserId;
    createdAt: Timestamp;
}
export interface ShareLink {
    id: ShareLinkId;
    token: string;
    owner: UserId;
    createdAt: Timestamp;
    scope: ShareScope;
}
export type VideoId = bigint;
export type CollectionId = bigint;
export interface CreateShareLinkRequest {
    scope: ShareScope;
}
export enum SortField {
    title = "title",
    fileSize = "fileSize",
    dateAdded = "dateAdded"
}
export enum SortOrder {
    asc = "asc",
    desc = "desc"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVideo(req: AddVideoRequest): Promise<Video>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    batchVideoAction(req: BatchVideoActionRequest): Promise<bigint>;
    createCollection(title: string): Promise<Collection>;
    createShareLink(req: CreateShareLinkRequest): Promise<ShareLink>;
    deleteCollection(id: CollectionId, strategy: DeleteCollectionStrategy): Promise<boolean>;
    deleteShareLink(id: ShareLinkId): Promise<boolean>;
    deleteVideo(id: VideoId): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getSharedVideos(token: string): Promise<Array<Video>>;
    getVideo(id: VideoId): Promise<Video | null>;
    isCallerAdmin(): Promise<boolean>;
    listCollections(): Promise<Array<Collection>>;
    listShareLinks(): Promise<Array<ShareLink>>;
    listVideos(filter: VideoFilter): Promise<Array<Video>>;
    moveVideo(videoId: VideoId, collectionId: CollectionId | null): Promise<boolean>;
    renameCollection(id: CollectionId, newTitle: string): Promise<boolean>;
    updateVideo(req: UpdateVideoRequest): Promise<boolean>;
}
