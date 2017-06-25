var express = require('express');
var multer = require('multer');
var upload = multer({
    dest: './public/images'
});
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

var router = express.Router();

router.route('/show/:id').get(function (req, res, next) {
    var posts = db.get('posts');

    posts.findById(req.params.id, (err, post) => {
        res.render('show', {
            'post': post
        });
    });

});

/* add posts. */
router.route('/add').get(function (req, res, next) {
        var categories = db.get('categories');

        categories.find({}, {}, (err, categories) => {
            res.render('addpost', {
                'title': 'Add Posts',
                'categories': categories
            });
        });

    })
    .post(upload.single('mainimage'), (req, res, next) => {
        var title = req.body.title;
        var category = req.body.category;
        var body = req.body.body;
        var author = req.body.author;
        var date = new Date();

        //check image upload
        if (req.file) {
            var mainimage = req.file.filename;
            console.log(mainimage);
        } else {
            var mainimage = 'noimage.jpeg';
        }

        //validations
        req.checkBody('title', 'Title shoild not be empty').notEmpty();
        req.checkBody('body', 'Body cannot be empty').notEmpty();

        //check errors
        var errors = req.validationErrors();

        if (errors) {
            res.render('addpost', {
                "errors": errors,
                "title": title,
                "body": body
            });
        } else {
            var posts = db.get('posts');
            posts.insert({
                "title": title,
                "body": body,
                "category": category,
                "date": date,
                "author": author,
                "mainimage": mainimage
            }, (err, post) => {
                if (err) {
                    res.send(err);
                } else {
                    req.flash('success', 'Post was added successfully');
                    res.location('/');
                    res.redirect('/');
                }
            });
        }
    });

router.route('/addcomment').post((req, res, next) => {
    var name = req.body.name;
    var postid = req.body.postid;
    var email = req.body.email;
    var body = req.body.body;
    var commentdate = new Date();

    //validations
    req.checkBody('name', 'Name should not be empty').notEmpty();
    req.checkBody('email', 'Email should not be empty').notEmpty();
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('body', 'Body cannot be empty').notEmpty();

    //check errors
    var errors = req.validationErrors();

    if (errors) {
        var posts = db.get('posts');
        posts.findById(postid, (err, post) => {
            res.render('show', {
                "errors": errors,
                "post": post
            });
        });

    } else {
        var comment = {
            "name": name,
            "email": email,
            "body": body,
            "commentdate": commentdate
        };
        var posts = db.get('posts');
        posts.update({
            "_id": postid
        }, {
            $push: {
                "comments": comment
            }
        }, (err, doc) => {
            if (err) throw err;
            else {
                console.log('burrah');
                req.flash('success', 'Comment was added successfully');
                res.location('/posts/show/' + postid);
                res.redirect('/posts/show/' + postid);
            }
        });
    }
});

module.exports = router;
