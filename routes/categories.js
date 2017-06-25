var express = require('express');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

var router = express.Router();

// show post
router.route('/show/:category').get((req, res, next) => {
    var posts = db.get('posts');
    posts.find({
        category: req.params.category
    }, {}, (err, posts) => {
        res.render('index', {
            'title': req.params.category,
            'posts': posts
        });
    });

});
/* add categories. */
router.route('/add').get(function (req, res, next) {
        res.render('addcategory', {
            'title': 'Add Categories'
        });
    })
    .post((req, res, next) => {
        var name = req.body.name;


        //validations
        req.checkBody('name', 'Name shoild not be empty').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            res.render('addcategories', {
                "errors": errors,
                "name": name
            });
        } else {
            var categories = db.get('categories');
            categories.insert({
                "name": name
            }, (err, category) => {
                if (err) {
                    res.send(err);
                } else {
                    req.flash('success', 'Category was added successfully');
                    res.location('/');
                    res.redirect('/');
                }
            });
        }
    });


module.exports = router;
