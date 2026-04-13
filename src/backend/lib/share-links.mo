import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";

module {
  public type ShareLinkStore = Map.Map<CommonTypes.ShareLinkId, CommonTypes.ShareLink>;

  // Generate a unique token from caller + id + timestamp
  func makeToken(caller : CommonTypes.UserId, id : Nat, ts : Int) : Text {
    caller.toText() # "-" # id.toText() # "-" # ts.toText();
  };

  public func createShareLink(
    store : ShareLinkStore,
    nextId : { var value : Nat },
    caller : CommonTypes.UserId,
    req : CommonTypes.CreateShareLinkRequest,
  ) : CommonTypes.ShareLink {
    let id = nextId.value;
    nextId.value += 1;
    let ts = Time.now();
    let token = makeToken(caller, id, ts);
    let shareLink : CommonTypes.ShareLink = {
      id = id.toText();
      owner = caller;
      scope = req.scope;
      token;
      createdAt = ts;
    };
    store.add(shareLink.id, shareLink);
    shareLink;
  };

  public func getShareLinkByToken(
    store : ShareLinkStore,
    token : Text,
  ) : ?CommonTypes.ShareLink {
    store.values()
      |> _.find(func(sl : CommonTypes.ShareLink) : Bool { Text.equal(sl.token, token) });
  };

  public func listShareLinks(
    store : ShareLinkStore,
    caller : CommonTypes.UserId,
  ) : [CommonTypes.ShareLink] {
    store.values()
      |> _.filter(func(sl : CommonTypes.ShareLink) : Bool {
        Principal.equal(sl.owner, caller)
      })
      |> _.toArray();
  };

  public func deleteShareLink(
    store : ShareLinkStore,
    caller : CommonTypes.UserId,
    id : CommonTypes.ShareLinkId,
  ) : Bool {
    switch (store.get(id)) {
      case (?sl) {
        if (not Principal.equal(sl.owner, caller)) { return false };
        store.remove(id);
        true;
      };
      case null { false };
    };
  };
};
