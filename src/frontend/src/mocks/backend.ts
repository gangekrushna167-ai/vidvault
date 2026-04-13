import type { backendInterface, Video, Collection } from "../backend";
import { SortField, SortOrder, UserRole } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const mockPrincipal = Principal.fromText("2vxsx-fae");
const now = BigInt(Date.now()) * BigInt(1_000_000);

const mockCollections: Collection[] = [
  {
    id: BigInt(1),
    title: "Documentaries",
    owner: mockPrincipal,
    createdAt: now - BigInt(10_000_000_000_000),
  },
  {
    id: BigInt(2),
    title: "Tutorials",
    owner: mockPrincipal,
    createdAt: now - BigInt(5_000_000_000_000),
  },
  {
    id: BigInt(3),
    title: "Short Films",
    owner: mockPrincipal,
    createdAt: now - BigInt(2_000_000_000_000),
  },
];

const mockVideos: Video[] = [
  {
    id: BigInt(1),
    title: "Into the Cosmos",
    description: "A breathtaking journey through the universe, exploring distant galaxies and nebulae.",
    filename: "cosmos.mp4",
    fileSize: BigInt(524_288_000),
    collectionId: BigInt(1),
    owner: mockPrincipal,
    createdAt: now - BigInt(3_600_000_000_000),
    tags: ["documentary", "space"],
    blob: {
      getBytes: async () => new Uint8Array(),
      getDirectURL: () => "https://placehold.co/640x360/1a1a1a/c4993a?text=Into+the+Cosmos",
      withUploadProgress: (fn: (p: number) => void) => ({ getBytes: async () => new Uint8Array(), getDirectURL: () => "", withUploadProgress: (_fn2: (p: number) => void) => ({}) }) as never,
    } as never,
  },
  {
    id: BigInt(2),
    title: "Urban Rhythms",
    description: "A cinematic exploration of city life, rhythm and movement in modern metropolises.",
    filename: "urban.mp4",
    fileSize: BigInt(314_572_800),
    collectionId: BigInt(3),
    owner: mockPrincipal,
    createdAt: now - BigInt(7_200_000_000_000),
    tags: ["short-film", "cinematic"],
    blob: {
      getBytes: async () => new Uint8Array(),
      getDirectURL: () => "https://placehold.co/640x360/1a1a1a/c4993a?text=Urban+Rhythms",
      withUploadProgress: (_fn: (p: number) => void) => ({}) as never,
    } as never,
  },
  {
    id: BigInt(3),
    title: "React Fundamentals",
    description: "A comprehensive tutorial on building modern web applications with React and TypeScript.",
    filename: "react-tutorial.mp4",
    fileSize: BigInt(209_715_200),
    collectionId: BigInt(2),
    owner: mockPrincipal,
    createdAt: now - BigInt(10_800_000_000_000),
    tags: ["tutorial", "react", "typescript"],
    blob: {
      getBytes: async () => new Uint8Array(),
      getDirectURL: () => "https://placehold.co/640x360/1a1a1a/c4993a?text=React+Fundamentals",
      withUploadProgress: (_fn: (p: number) => void) => ({}) as never,
    } as never,
  },
  {
    id: BigInt(4),
    title: "Ocean Deep",
    description: "An immersive documentary about the secrets of the deep ocean and its extraordinary creatures.",
    filename: "ocean.mp4",
    fileSize: BigInt(786_432_000),
    collectionId: BigInt(1),
    owner: mockPrincipal,
    createdAt: now - BigInt(14_400_000_000_000),
    tags: ["documentary", "nature"],
    blob: {
      getBytes: async () => new Uint8Array(),
      getDirectURL: () => "https://placehold.co/640x360/1a1a1a/c4993a?text=Ocean+Deep",
      withUploadProgress: (_fn: (p: number) => void) => ({}) as never,
    } as never,
  },
  {
    id: BigInt(5),
    title: "TypeScript Masterclass",
    description: "Advanced TypeScript patterns and techniques for enterprise-grade applications.",
    filename: "typescript-masterclass.mp4",
    fileSize: BigInt(419_430_400),
    collectionId: BigInt(2),
    owner: mockPrincipal,
    createdAt: now - BigInt(18_000_000_000_000),
    tags: ["tutorial", "typescript"],
    blob: {
      getBytes: async () => new Uint8Array(),
      getDirectURL: () => "https://placehold.co/640x360/1a1a1a/c4993a?text=TypeScript+Masterclass",
      withUploadProgress: (_fn: (p: number) => void) => ({}) as never,
    } as never,
  },
  {
    id: BigInt(6),
    title: "The Last Light",
    description: "Award-winning short film about loss, memory and the beauty of impermanence.",
    filename: "last-light.mp4",
    fileSize: BigInt(157_286_400),
    collectionId: BigInt(3),
    owner: mockPrincipal,
    createdAt: now - BigInt(21_600_000_000_000),
    tags: ["short-film", "award-winning"],
    blob: {
      getBytes: async () => new Uint8Array(),
      getDirectURL: () => "https://placehold.co/640x360/1a1a1a/c4993a?text=The+Last+Light",
      withUploadProgress: (_fn: (p: number) => void) => ({}) as never,
    } as never,
  },
];

export const mockBackend: backendInterface = {
  addVideo: async (req) => ({
    ...req,
    id: BigInt(99),
    tags: req.tags ?? [],
    owner: mockPrincipal,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),
  assignCallerUserRole: async () => undefined,
  batchVideoAction: async () => BigInt(0),
  createCollection: async (title) => ({
    id: BigInt(99),
    title,
    owner: mockPrincipal,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),
  createShareLink: async (req) => ({
    id: "mock-link-1",
    token: "mock-token-abc",
    owner: mockPrincipal,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    scope: req.scope,
  }),
  deleteCollection: async () => true,
  deleteShareLink: async () => true,
  deleteVideo: async () => true,
  getCallerUserRole: async () => UserRole.admin,
  getSharedVideos: async () => mockVideos,
  getVideo: async (id) => mockVideos.find((v) => v.id === id) ?? null,
  isCallerAdmin: async () => true,
  listCollections: async () => mockCollections,
  listShareLinks: async () => [],
  listVideos: async (filter) => {
    let videos = [...mockVideos];
    if (filter.collectionId !== undefined) {
      videos = videos.filter((v) => v.collectionId === filter.collectionId);
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.description.toLowerCase().includes(term)
      );
    }
    if (filter.tags && filter.tags.length > 0) {
      videos = videos.filter((v) =>
        filter.tags!.some((t) => v.tags.includes(t))
      );
    }
    return videos;
  },
  moveVideo: async () => true,
  renameCollection: async () => true,
  updateVideo: async () => true,
  _immutableObjectStorageBlobsAreLive: async (hashes) => hashes.map(() => true),
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,
  _immutableObjectStorageCreateCertificate: async () => ({ __variant__: "ok" as const, ok: new Uint8Array() } as never),
  _immutableObjectStorageRefillCashier: async () => ({} as never),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,
};
