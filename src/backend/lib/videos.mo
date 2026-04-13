import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/videos";
import CommonTypes "../types/common";

module {
  public type VideoStore = Map.Map<CommonTypes.VideoId, Types.VideoInternal>;

  public func addVideo(
    store : VideoStore,
    nextId : Nat,
    caller : CommonTypes.UserId,
    req : Types.AddVideoRequest,
  ) : Types.VideoInternal {
    let video : Types.VideoInternal = {
      id = nextId;
      owner = caller;
      var title = req.title;
      var description = req.description;
      var collectionId = req.collectionId;
      var tags = switch (req.tags) { case (?t) t; case null [] };
      blob = req.blob;
      thumbnail = req.thumbnail;
      filename = req.filename;
      var fileSize = req.fileSize;
      createdAt = Time.now();
    };
    store.add(nextId, video);
    video;
  };

  public func getVideo(
    store : VideoStore,
    id : CommonTypes.VideoId,
    caller : CommonTypes.UserId,
  ) : ?Types.VideoInternal {
    switch (store.get(id)) {
      case (?video) {
        if (Principal.equal(video.owner, caller)) { ?video } else { null };
      };
      case null { null };
    };
  };

  public func listVideos(
    store : VideoStore,
    caller : CommonTypes.UserId,
    filter : CommonTypes.VideoFilter,
  ) : [Types.Video] {
    let all = store.values()
      |> _.filter(func(v : Types.VideoInternal) : Bool {
        Principal.equal(v.owner, caller)
      })
      |> _.filter(func(v : Types.VideoInternal) : Bool {
        switch (filter.searchTerm) {
          case null { true };
          case (?term) {
            let lower = term.toLower();
            v.title.toLower().contains(#text lower) or
            v.description.toLower().contains(#text lower);
          };
        };
      })
      |> _.filter(func(v : Types.VideoInternal) : Bool {
        switch (filter.collectionId) {
          case null { true };
          case (?cid) {
            switch (v.collectionId) {
              case (?vcid) { Nat.equal(vcid, cid) };
              case null { false };
            };
          };
        };
      })
      |> _.filter(func(v : Types.VideoInternal) : Bool {
        switch (filter.tags) {
          case null { true };
          case (?filterTags) {
            filterTags.any(func(ft : Text) : Bool {
              v.tags.any(func(vt : Text) : Bool { Text.equal(ft, vt) })
            });
          };
        };
      })
      |> _.filter(func(v : Types.VideoInternal) : Bool {
        switch (filter.dateFrom) {
          case null { true };
          case (?from) { v.createdAt >= from };
        };
      })
      |> _.filter(func(v : Types.VideoInternal) : Bool {
        switch (filter.dateTo) {
          case null { true };
          case (?to) { v.createdAt <= to };
        };
      })
      |> _.map(func(v : Types.VideoInternal) : Types.Video { toPublic(v) })
      |> _.toArray();

    let compare : (Types.Video, Types.Video) -> { #less; #equal; #greater } = switch (filter.sortField) {
      case (#title) func(a, b) = Text.compare(a.title, b.title);
      case (#dateAdded) func(a, b) = Int.compare(a.createdAt, b.createdAt);
      case (#fileSize) func(a, b) = Nat.compare(a.fileSize, b.fileSize);
    };

    let sorted = all.sort(func(a, b) {
      switch (filter.sortOrder) {
        case (#asc) { compare(a, b) };
        case (#desc) { compare(b, a) };
      };
    });
    sorted;
  };

  public func updateVideo(
    store : VideoStore,
    caller : CommonTypes.UserId,
    req : Types.UpdateVideoRequest,
  ) : Bool {
    switch (store.get(req.id)) {
      case (?video) {
        if (not Principal.equal(video.owner, caller)) { return false };
        video.title := req.title;
        video.description := req.description;
        video.collectionId := req.collectionId;
        switch (req.tags) {
          case (?tags) { video.tags := tags };
          case null {};
        };
        true;
      };
      case null { false };
    };
  };

  public func deleteVideo(
    store : VideoStore,
    caller : CommonTypes.UserId,
    id : CommonTypes.VideoId,
  ) : Bool {
    switch (store.get(id)) {
      case (?video) {
        if (not Principal.equal(video.owner, caller)) { return false };
        store.remove(id);
        true;
      };
      case null { false };
    };
  };

  public func moveVideo(
    store : VideoStore,
    caller : CommonTypes.UserId,
    videoId : CommonTypes.VideoId,
    collectionId : ?CommonTypes.CollectionId,
  ) : Bool {
    switch (store.get(videoId)) {
      case (?video) {
        if (not Principal.equal(video.owner, caller)) { return false };
        video.collectionId := collectionId;
        true;
      };
      case null { false };
    };
  };

  public func moveVideosByCollection(
    store : VideoStore,
    caller : CommonTypes.UserId,
    fromCollectionId : CommonTypes.CollectionId,
    toCollectionId : ?CommonTypes.CollectionId,
  ) : () {
    store.values()
      |> _.forEach(func(video : Types.VideoInternal) {
        if (Principal.equal(video.owner, caller)) {
          switch (video.collectionId) {
            case (?cid) {
              if (Nat.equal(cid, fromCollectionId)) {
                video.collectionId := toCollectionId;
              };
            };
            case null {};
          };
        };
      });
  };

  public func deleteVideosByCollection(
    store : VideoStore,
    caller : CommonTypes.UserId,
    collectionId : CommonTypes.CollectionId,
  ) : () {
    let toDelete = store.entries()
      |> _.filter(func((_, v) : (CommonTypes.VideoId, Types.VideoInternal)) : Bool {
        if (not Principal.equal(v.owner, caller)) { return false };
        switch (v.collectionId) {
          case (?cid) { Nat.equal(cid, collectionId) };
          case null { false };
        };
      })
      |> _.map(func((id, _) : (CommonTypes.VideoId, Types.VideoInternal)) : CommonTypes.VideoId { id })
      |> _.toArray();

    for (id in toDelete.values()) {
      store.remove(id);
    };
  };

  public func toPublic(v : Types.VideoInternal) : Types.Video {
    {
      id = v.id;
      owner = v.owner;
      title = v.title;
      description = v.description;
      collectionId = v.collectionId;
      tags = v.tags;
      blob = v.blob;
      thumbnail = v.thumbnail;
      filename = v.filename;
      fileSize = v.fileSize;
      createdAt = v.createdAt;
    };
  };
};
