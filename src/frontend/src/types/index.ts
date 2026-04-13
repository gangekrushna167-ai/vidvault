import type { Principal } from "@icp-sdk/core/principal";
import type { ExternalBlob } from "../backend";

export type { ShareScope, ShareLink, BatchAction } from "../backend.d";

export interface Video {
  id: bigint;
  owner: Principal;
  title: string;
  description: string;
  collectionId?: bigint;
  blob: ExternalBlob;
  thumbnail?: ExternalBlob;
  filename: string;
  fileSize: bigint;
  createdAt: bigint;
  tags: string[];
}

export interface Collection {
  id: bigint;
  owner: Principal;
  title: string;
  createdAt: bigint;
}

export interface VideoFilter {
  searchTerm?: string | null;
  collectionId?: bigint | null;
  dateFrom?: bigint | null;
  dateTo?: bigint | null;
  tags?: string[] | null;
  sortField: { title: null } | { dateAdded: null } | { fileSize: null };
  sortOrder: { asc: null } | { desc: null };
}

export interface AddVideoRequest {
  title: string;
  description: string;
  blob: ExternalBlob;
  thumbnail?: ExternalBlob | null;
  filename: string;
  fileSize: bigint;
  collectionId?: bigint | null;
  tags?: string[] | null;
}

export interface UpdateVideoRequest {
  id: bigint;
  title: string;
  description: string;
  collectionId?: bigint | null;
  tags?: string[] | null;
}

export type DeleteCollectionStrategy =
  | { deleteVideos: null }
  | { moveToCollection: bigint }
  | { moveToUncategorized: null };

export interface ShareLinkRecord {
  id: string;
  token: string;
  owner: Principal;
  createdAt: bigint;
  scope: ShareScopeType;
}

export type ShareScopeType =
  | { library: null }
  | { collection: bigint }
  | { tag: string };

export interface CreateShareLinkRequest {
  scope: ShareScopeType;
}

export interface BatchVideoActionRequest {
  videoIds: bigint[];
  action: BatchActionType;
}

export type BatchActionType =
  | { addTags: string[] }
  | { removeTags: string[] }
  | { moveToCollection: bigint | null }
  | { delete: null };
