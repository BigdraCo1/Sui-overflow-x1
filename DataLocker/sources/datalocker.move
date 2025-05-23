module datalocker::datalocker;

use walrus::{
    blob::Blob,
    storage_resource::Storage,
};
use sui::coin::Coin;
use sui::sui::{
    SUI,
};
use walrus::system::{System, delete_blob};
use datalocker::allowlist::{Allowlist, Cap, get_allowlist_id, get_publisher};

const EInvalidCap: u64 = 0;
const EBrokie: u64 = 1;

public fun allowlist_delete_blob(allowlist: &mut Allowlist, sys: &System, blob: Blob, cap: &Cap, payment: Coin<SUI>): Storage {
    assert!(get_allowlist_id(cap) == object::id(allowlist), EInvalidCap);
    assert!( payment.value() <= blob.size(), EBrokie);
    transfer::public_transfer(payment, get_publisher(allowlist));
    delete_blob(sys, blob)
}
