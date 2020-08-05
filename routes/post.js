const express = require('express');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();
const postControllers = require('../controllers/posts');
const extractFiles = require('../middleware/file');




router.post("", checkAuth, extractFiles, postControllers.createPost);

router.get('', postControllers.getPosts);

router.put('/:id', checkAuth, extractFiles, postControllers.editPost);

router.get('/:id', postControllers.getPostById);

router.delete('/:id', checkAuth, postControllers.deletePost);

module.exports = router;