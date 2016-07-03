interface Node_Hash {
    sha256: (text, salt) => string;
}

declare var hash: Node_Hash;

declare module "node_hash" {
    export = hash;
}