import Storage "mo:caffeineai-object-storage/Storage";
import CommonTypes "common";

module {
  public type VideoId = CommonTypes.VideoId;
  public type CollectionId = CommonTypes.CollectionId;
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;

  public type VideoInternal = {
    id : VideoId;
    owner : UserId;
    var title : Text;
    var description : Text;
    var collectionId : ?CollectionId;
    var tags : [Text];
    blob : Storage.ExternalBlob;
    thumbnail : ?Storage.ExternalBlob;
    filename : Text;
    var fileSize : Nat;
    createdAt : Timestamp;
  };

  public type Video = {
    id : VideoId;
    owner : UserId;
    title : Text;
    description : Text;
    collectionId : ?CollectionId;
    tags : [Text];
    blob : Storage.ExternalBlob;
    thumbnail : ?Storage.ExternalBlob;
    filename : Text;
    fileSize : Nat;
    createdAt : Timestamp;
  };

  public type AddVideoRequest = {
    title : Text;
    description : Text;
    blob : Storage.ExternalBlob;
    thumbnail : ?Storage.ExternalBlob;
    filename : Text;
    fileSize : Nat;
    collectionId : ?CollectionId;
    tags : ?[Text];
  };

  public type UpdateVideoRequest = {
    id : VideoId;
    title : Text;
    description : Text;
    collectionId : ?CollectionId;
    tags : ?[Text];
  };
};
