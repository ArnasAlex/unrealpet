class UpdatePawsMigration{
    up = (db: any) => {

        db.post.find({})
            .forEach(function (post) {
                var hasPaws = post.paws && post.paws.length > 0;
                var hasComments = post.comments && post.comments.length > 0;

                if (!hasPaws && !hasComments){
                    return;
                }

                if (hasPaws){
                    var paws = post.paws;
                    post.paws = [];

                    paws.forEach(function (paw) {
                        if (paw.ownerId){
                            post.paws.push(paw);
                        }
                        else{
                            post.paws.push({
                                ownerId: paw,
                                createdOn: new Date()
                            });
                        }
                    });
                }

                if (hasComments){
                    post.comments.forEach(function(comment) {
                        if (comment.paws && comment.paws.length > 0){
                            var paws = comment.paws;
                            comment.paws = [];

                            paws.forEach(function(paw) {
                                if (paw.ownerId){
                                    comment.paws.push(paw);
                                }
                                else{
                                    comment.paws.push({
                                        ownerId: paw,
                                        createdOn: new Date()
                                    });
                                }
                            });
                        }
                    });
                }

                db.post.save(post);
            });

    }
}