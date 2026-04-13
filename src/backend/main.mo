import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import VideoLib "lib/videos";
import CollectionLib "lib/collections";
import ShareLinkLib "lib/share-links";
import VideosMixin "mixins/videos-api";
import CollectionsMixin "mixins/collections-api";
import ShareLinksMixin "mixins/share-links-api";
import BatchMixin "mixins/batch-api";
import CommonTypes "types/common";
import VideoTypes "types/videos";
import CollectionTypes "types/collections";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  let videoStore : VideoLib.VideoStore = Map.empty<CommonTypes.VideoId, VideoTypes.VideoInternal>();
  let collectionStore : CollectionLib.CollectionStore = Map.empty<CommonTypes.CollectionId, CollectionTypes.CollectionInternal>();
  let shareLinkStore : ShareLinkLib.ShareLinkStore = Map.empty<CommonTypes.ShareLinkId, CommonTypes.ShareLink>();
  let nextVideoIdValue : Nat = 0;
  let nextCollectionIdValue : Nat = 0;
  let nextShareLinkIdValue : Nat = 0;

  let nextVideoId = { var value = nextVideoIdValue };
  let nextCollectionId = { var value = nextCollectionIdValue };
  let nextShareLinkId = { var value = nextShareLinkIdValue };

  include VideosMixin(accessControlState, videoStore, collectionStore, nextVideoId);
  include CollectionsMixin(accessControlState, videoStore, collectionStore, nextCollectionId);
  include ShareLinksMixin(accessControlState, videoStore, shareLinkStore, nextShareLinkId);
  include BatchMixin(accessControlState, videoStore, collectionStore);
};
