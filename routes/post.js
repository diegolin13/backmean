const express = require('express');
const multer = require('multer');
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();


const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        if (isValid) {
            error = null
        }
        cb(null, 'images'); //folder donde se guardaran las imagenes
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post("", checkAuth, multer({ storage: storage }).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    post.save((err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Post failed'
            });
        }
        res.status(201).json({
            message: 'Post created and received on the server',
            post: {
                id: result._id,
                title: result.title,
                content: result.content,
                imagePath: result.imagePath
            }
        });
    });

});

router.get('', (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();

    if (pageSize && currentPage) {
        return Post.find().skip(pageSize * (currentPage - 1)).limit(pageSize)
            .exec((err, data) => {
                if (err) {
                    return res.status(500).json({ message: 'Error fetching posts' })
                }
                res.json({ ok: true, posts: data });
            });
    }

    Post.find((err, data) => {
        if (err) {
            return res.status(400).json({
                message: 'error fetching data'
            });
        }

        res.json({
            ok: true,
            posts: data
        });
    });
});

router.put('/:id', checkAuth, multer({ storage: storage }).single('image'), (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Error editing data'
            });
        }

        if (result.nModified > 0) {
            res.json({
                message: 'Post updated successfully',
                result
            });
        } else {
            res.status(401).json({
                message: 'Unauthorized to edit posts'
            });
        }



    });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id, (err, post) => {
        if (err) {
            return res.status(500).json({
                message: 'Post not found'
            });
        }
        res.json({
            post
        });
    });
});

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    Post.deleteOne({ _id: id, creator: req.userData.userId }, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Error deleting the post'
            });
        }
        if (result.n > 0) {
            res.json({
                message: 'Post updated successfully',
                result
            });
        } else {
            res.status(401).json({
                message: 'Unauthorized to edit posts'
            });
        }
    });

});

module.exports = router;