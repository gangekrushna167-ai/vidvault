import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/collections";
import CommonTypes "../types/common";

module {
  public type CollectionStore = Map.Map<CommonTypes.CollectionId, Types.CollectionInternal>;

  public func createCollection(
    store : CollectionStore,
    nextId : Nat,
    caller : CommonTypes.UserId,
    title : Text,
  ) : Types.CollectionInternal {
    let collection : Types.CollectionInternal = {
      id = nextId;
      owner = caller;
      var title = title;
      createdAt = Time.now();
    };
    store.add(nextId, collection);
    collection;
  };

  public func getCollection(
    store : CollectionStore,
    id : CommonTypes.CollectionId,
    caller : CommonTypes.UserId,
  ) : ?Types.CollectionInternal {
    switch (store.get(id)) {
      case (?col) {
        if (Principal.equal(col.owner, caller)) { ?col } else { null };
      };
      case null { null };
    };
  };

  public func listCollections(
    store : CollectionStore,
    caller : CommonTypes.UserId,
  ) : [Types.Collection] {
    store.values()
      |> _.filter(func(c : Types.CollectionInternal) : Bool {
        Principal.equal(c.owner, caller)
      })
      |> _.map(func(c : Types.CollectionInternal) : Types.Collection { toPublic(c) })
      |> _.toArray();
  };

  public func renameCollection(
    store : CollectionStore,
    caller : CommonTypes.UserId,
    id : CommonTypes.CollectionId,
    newTitle : Text,
  ) : Bool {
    switch (store.get(id)) {
      case (?col) {
        if (not Principal.equal(col.owner, caller)) { return false };
        col.title := newTitle;
        true;
      };
      case null { false };
    };
  };

  public func deleteCollection(
    store : CollectionStore,
    caller : CommonTypes.UserId,
    id : CommonTypes.CollectionId,
  ) : Bool {
    switch (store.get(id)) {
      case (?col) {
        if (not Principal.equal(col.owner, caller)) { return false };
        store.remove(id);
        true;
      };
      case null { false };
    };
  };

  public func toPublic(c : Types.CollectionInternal) : Types.Collection {
    {
      id = c.id;
      owner = c.owner;
      title = c.title;
      createdAt = c.createdAt;
    };
  };
};
