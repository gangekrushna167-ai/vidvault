module {
  public type UserId = Principal;
  public type VideoId = Nat;
  public type CollectionId = Nat;
  public type Timestamp = Int;

  public type SortField = {
    #title;
    #dateAdded;
    #fileSize;
  };

  public type SortOrder = {
    #asc;
    #desc;
  };

  public type VideoFilter = {
    searchTerm : ?Text;
    collectionId : ?CollectionId;
    tags : ?[Text];
    dateFrom : ?Timestamp;
    dateTo : ?Timestamp;
    sortField : SortField;
    sortOrder : SortOrder;
  };

  public type Tag = Text;

  public type ShareScope = {
    #library;
    #collection : CollectionId;
    #tag : Text;
  };

  public type ShareLinkId = Text;

  public type ShareLink = {
    id : ShareLinkId;
    owner : UserId;
    scope : ShareScope;
    token : Text;
    createdAt : Timestamp;
  };

  public type CreateShareLinkRequest = {
    scope : ShareScope;
  };

  public type BatchAction = {
    #addTags : [Text];
    #removeTags : [Text];
    #moveToCollection : ?CollectionId;
    #delete;
  };

  public type BatchVideoActionRequest = {
    videoIds : [VideoId];
    action : BatchAction;
  };
};
