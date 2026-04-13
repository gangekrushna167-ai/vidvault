import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import VideoLib "../lib/videos";
import CollectionLib "../lib/collections";
import CommonTypes "../types/common";

mixin (
  _accessControlState : AccessControl.AccessControlState,
  videoStore : VideoLib.VideoStore,
  _collectionStore : CollectionLib.CollectionStore,
) {
  public shared ({ caller }) func batchVideoAction(
    req : CommonTypes.BatchVideoActionRequest,
  ) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    var count = 0;
    for (videoId in req.videoIds.values()) {
      switch (videoStore.get(videoId)) {
        case (?video) {
          if (Principal.equal(video.owner, caller)) {
            switch (req.action) {
              case (#addTags newTags) {
                let existing = Set.fromArray(video.tags);
                existing.addAll(newTags.values());
                video.tags := existing.toArray();
                count += 1;
              };
              case (#removeTags tagsToRemove) {
                let removeSet = Set.fromArray(tagsToRemove);
                video.tags := video.tags.filter(func(t : Text) : Bool {
                  not removeSet.contains(t)
                });
                count += 1;
              };
              case (#moveToCollection colId) {
                video.collectionId := colId;
                count += 1;
              };
              case (#delete) {
                videoStore.remove(videoId);
                count += 1;
              };
            };
          };
        };
        case null {};
      };
    };
    count;
  };
};
