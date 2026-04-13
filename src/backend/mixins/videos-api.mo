import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import VideoLib "../lib/videos";
import CollectionLib "../lib/collections";
import VideoTypes "../types/videos";
import CommonTypes "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  videoStore : VideoLib.VideoStore,
  collectionStore : CollectionLib.CollectionStore,
  nextVideoId : { var value : Nat },
) {
  public shared ({ caller }) func addVideo(req : VideoTypes.AddVideoRequest) : async VideoTypes.Video {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add videos");
    };
    let id = nextVideoId.value;
    nextVideoId.value += 1;
    let internal = VideoLib.addVideo(videoStore, id, caller, req);
    VideoLib.toPublic(internal);
  };

  public query ({ caller }) func getVideo(id : CommonTypes.VideoId) : async ?VideoTypes.Video {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access videos");
    };
    switch (VideoLib.getVideo(videoStore, id, caller)) {
      case (?v) { ?VideoLib.toPublic(v) };
      case null { null };
    };
  };

  public query ({ caller }) func listVideos(filter : CommonTypes.VideoFilter) : async [VideoTypes.Video] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list videos");
    };
    VideoLib.listVideos(videoStore, caller, filter);
  };

  public shared ({ caller }) func updateVideo(req : VideoTypes.UpdateVideoRequest) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update videos");
    };
    VideoLib.updateVideo(videoStore, caller, req);
  };

  public shared ({ caller }) func deleteVideo(id : CommonTypes.VideoId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete videos");
    };
    VideoLib.deleteVideo(videoStore, caller, id);
  };

  public shared ({ caller }) func moveVideo(
    videoId : CommonTypes.VideoId,
    collectionId : ?CommonTypes.CollectionId,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can move videos");
    };
    VideoLib.moveVideo(videoStore, caller, videoId, collectionId);
  };
};
