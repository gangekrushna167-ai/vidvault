import CommonTypes "common";

module {
  public type CollectionId = CommonTypes.CollectionId;
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;

  public type CollectionInternal = {
    id : CollectionId;
    owner : UserId;
    var title : Text;
    createdAt : Timestamp;
  };

  public type Collection = {
    id : CollectionId;
    owner : UserId;
    title : Text;
    createdAt : Timestamp;
  };

  public type DeleteCollectionStrategy = {
    #deleteVideos;
    #moveToCollection : CollectionId;
    #moveToUncategorized;
  };
};
