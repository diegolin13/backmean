const express = require('express');
const Post = require('../models/post');
const router = express.Router();

router.post("", (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
    });
    post.save((err, result) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }
        res.status(201).json({
            message: 'Post created and received on the server',
            postId: result._id
        });
    });

});

router.get('', (req, res, next) => {
    Post.find((err, data) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        res.json({
            ok: true,
            posts: data
        });
    });
});

router.put('/:id', (req, res, next) => {
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content
    })
    Post.updateOne({ _id: req.params.id }, post, (err, result) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        res.json({
            message: 'Post updated successfully',
            result
        })

    });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id, (err, post) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            post
        });
    });
});

router.delete(':id', (req, res, next) => {
    const id = req.params.id;
    Post.deleteOne({ _id: id }, (err, result) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }
        res.json({
            message: 'Post deleted',
            id
        });
    });

});

module.exports = router;