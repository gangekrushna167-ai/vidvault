import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import VideoLib "../lib/videos";
import ShareLinkLib "../lib/share-links";
import VideoTypes "../types/videos";
import CommonTypes "../types/common";

mixin (
  _accessControlState : AccessControl.AccessControlState,
  videoStore : VideoLib.VideoStore,
  shareLinkStore : ShareLinkLib.ShareLinkStore,
  nextShareLinkId : { var value : Nat },
) {
  public shared ({ caller }) func createShareLink(
    req : CommonTypes.CreateShareLinkRequest,
  ) : async CommonTypes.ShareLink {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ShareLinkLib.createShareLink(shareLinkStore, nextShareLinkId, caller, req);
  };

  public query func getSharedVideos(token : Text) : async [VideoTypes.Video] {
    let shareLink = switch (ShareLinkLib.getShareLinkByToken(shareLinkStore, token)) {
      case (?sl) { sl };
      case null { Runtime.trap("Share link not found") };
    };
    let owner = shareLink.owner;
    switch (shareLink.scope) {
      case (#library) {
        videoStore.values()
          |> _.filter(func(v : VideoTypes.VideoInternal) : Bool {
            Principal.equal(v.owner, owner)
          })
          |> _.map(func(v : VideoTypes.VideoInternal) : VideoTypes.Video {
            VideoLib.toPublic(v)
          })
          |> _.toArray();
      };
      case (#collection colId) {
        videoStore.values()
          |> _.filter(func(v : VideoTypes.VideoInternal) : Bool {
            if (not Principal.equal(v.owner, owner)) { return false };
            switch (v.collectionId) {
              case (?cid) { cid == colId };
              case null { false };
            };
          })
          |> _.map(func(v : VideoTypes.VideoInternal) : VideoTypes.Video {
            VideoLib.toPublic(v)
          })
          |> _.toArray();
      };
      case (#tag tag) {
        videoStore.values()
          |> _.filter(func(v : VideoTypes.VideoInternal) : Bool {
            if (not Principal.equal(v.owner, owner)) { return false };
            v.tags.any(func(t : Text) : Bool { t == tag });
          })
          |> _.map(func(v : VideoTypes.VideoInternal) : VideoTypes.Video {
            VideoLib.toPublic(v)
          })
          |> _.toArray();
      };
    };
  };

  public query ({ caller }) func listShareLinks() : async [CommonTypes.ShareLink] {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ShareLinkLib.listShareLinks(shareLinkStore, caller);
  };

  public shared ({ caller }) func deleteShareLink(id : CommonTypes.ShareLinkId) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    ShareLinkLib.deleteShareLink(shareLinkStore, caller, id);
  };
};
