import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import VideoLib "../lib/videos";
import CollectionLib "../lib/collections";
import CollectionTypes "../types/collections";
import CommonTypes "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  videoStore : VideoLib.VideoStore,
  collectionStore : CollectionLib.CollectionStore,
  nextCollectionId : { var value : Nat },
) {
  public shared ({ caller }) func createCollection(title : Text) : async CollectionTypes.Collection {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create collections");
    };
    let id = nextCollectionId.value;
    nextCollectionId.value += 1;
    let internal = CollectionLib.createCollection(collectionStore, id, caller, title);
    CollectionLib.toPublic(internal);
  };

  public query ({ caller }) func listCollections() : async [CollectionTypes.Collection] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list collections");
    };
    CollectionLib.listCollections(collectionStore, caller);
  };

  public shared ({ caller }) func renameCollection(
    id : CommonTypes.CollectionId,
    newTitle : Text,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can rename collections");
    };
    CollectionLib.renameCollection(collectionStore, caller, id, newTitle);
  };

  public shared ({ caller }) func deleteCollection(
    id : CommonTypes.CollectionId,
    strategy : CollectionTypes.DeleteCollectionStrategy,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete collections");
    };
    switch (strategy) {
      case (#deleteVideos) {
        VideoLib.deleteVideosByCollection(videoStore, caller, id);
      };
      case (#moveToCollection(targetId)) {
        VideoLib.moveVideosByCollection(videoStore, caller, id, ?targetId);
      };
      case (#moveToUncategorized) {
        VideoLib.moveVideosByCollection(videoStore, caller, id, null);
      };
    };
    CollectionLib.deleteCollection(collectionStore, caller, id);
  };
};
